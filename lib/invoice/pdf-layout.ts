import { amountSentence } from './amount-words';
import type { PDFFont } from 'pdf-lib';
import type { Invoice } from './model';
import { cents, currency, displayDate, total } from './model';
import { branding, invoiceLayout as l } from './branding';

// pdf-lib emits standard-font glyphs without kerning adjustments. Measure those
// exact advances so wrapping and right/center alignment match the drawn PDF.
export function textWidth(text: string, font: PDFFont, size: number): number {
    return Array.from(text).reduce((sum, character) => sum + font.widthOfTextAtSize(character, size), 0);
}

// Use the embedded font's glyph advances, not a character-count estimate.
// Explicit line breaks are preserved; oversized words are broken by glyph.
export function wrapText(text: string, font: PDFFont, size: number, width: number): string[] {
    const result: string[] = [];
    for (const paragraph of text.replace(/\t/g, '    ').split(/\r?\n/)) {
        let line = '';
        for (const word of paragraph.split(/\s+/).filter(Boolean)) {
            if (textWidth(line ? `${line} ${word}` : word, font, size) <= width) {
                line = line ? `${line} ${word}` : word;
                continue;
            }
            if (line) { result.push(line); line = ''; }
            for (const character of word) {
                if (textWidth(line + character, font, size) > width && line) {
                    result.push(line); line = '';
                }
                line += character;
            }
        }
        result.push(line);
    }
    return result;
}

export type MeasuredRow = { cells: string[][]; height: number; sourceIndex: number };
export type PlannedPage = { rows: MeasuredRow[]; totals: boolean; tableTop: number };

export function measureInvoice(invoice: Invoice, regular: PDFFont, bold: PDFFont = regular) {
    const width = l.right - l.left;
    const columnWidth = (width - l.columnGap) / 2;
    const patientX = l.left + columnWidth + l.columnGap;
    const labelWidth = textWidth('Patient : ', bold, l.fontSize);
    const title = wrapText(`FACTURE N° : ${invoice.number}`, bold, 18, width);
    const informationTop = Math.max(l.informationTop, l.titleTop + title.length * 22 + 12);
    const address = wrapText(branding.address, regular, 8.5, columnWidth);
    const patient = wrapText(invoice.patient, regular, l.fontSize, columnWidth - labelWidth);
    const informationHeight = Math.max(16 + address.length * l.lineHeight, patient.length * l.lineHeight);
    const firstTableTop = Math.max(l.tableTop, informationTop + informationHeight + 16);
    const sentence = wrapText(amountSentence(total(invoice)), regular, l.fontSize, width);
    const totalsHeight = 6 + 18 + sentence.length * l.lineHeight + 8 + (invoice.paid === '' ? 0 : 32) + l.signatureSpace;
    return { title, address, patient, patientX, labelWidth, informationTop, firstTableTop, sentence, totalsHeight };
}

export function planInvoice(invoice: Invoice, font: PDFFont, bold: PDFFont = font) {
    const measured = measureInvoice(invoice, font, bold);
    const rows = invoice.treatments.map((row, sourceIndex): MeasuredRow => {
        const cells = [displayDate(row.date), row.tooth || '—', row.description, currency(cents(row.price))]
            .map((text, i) => wrapText(text, font, l.fontSize, l.columns[i] - l.cellPadding * 2));
        return { cells, height: Math.max(...cells.map(c => c.length)) * l.lineHeight + l.cellPadding * 2, sourceIndex };
    });
    const pages: PlannedPage[] = [{ rows: [], totals: false, tableTop: measured.firstTableTop }];
    let used = 0;
    for (const row of rows) {
        let page = pages[pages.length - 1];
        const capacity = l.bottom - page.tableTop - l.headingHeight;
        if (row.height > l.bottom - l.continuationTableTop - l.headingHeight) throw new Error('Un acte est trop long pour la zone imprimable. Réduisez sa description ou ses sauts de ligne.');
        if (used + row.height > capacity) {
            page = { rows: [], totals: false, tableTop: l.continuationTableTop };
            pages.push(page); used = 0;
        }
        page.rows.push(row); used += row.height;
    }
    const last = pages[pages.length - 1];
    const finalBottom = l.fiscalTop - 12;
    if (last.tableTop + l.headingHeight + used + measured.totalsHeight > finalBottom) {
        const final: PlannedPage = { rows: [], totals: true, tableTop: l.continuationTableTop };
        const capacity = finalBottom - final.tableTop - l.headingHeight;
        let movedHeight = 0;
        // Keep the final treatments next to the grand total whenever they fit.
        // Balance the tail across both pages, retaining at least one row on the previous page.
        while (last.rows.length > 1) {
            const row = last.rows[last.rows.length - 1];
            if (movedHeight + row.height + measured.totalsHeight > capacity || movedHeight + measured.totalsHeight >= used - movedHeight) break;
            final.rows.unshift(last.rows.pop()!);
            movedHeight += row.height;
        }
        pages.push(final);
    } else last.totals = true;
    return pages;
}
