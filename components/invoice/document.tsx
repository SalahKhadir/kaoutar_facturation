import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { branding, INVOICE_TEXT_COLOR, INVOICE_HEADING_COLOR, invoiceLayout as l } from '@/lib/invoice/branding';
import { backgroundError, loadBackground, validateBackgroundDimensions } from '@/lib/invoice/background';
import { measureInvoice, planInvoice, textWidth, wrapText } from '@/lib/invoice/pdf-layout';
import { invoiceSchema, type Invoice, total, balance, cents, currency, displayDate } from '@/lib/invoice/model';

const ink = rgb(...[1, 3, 5].map(start => parseInt(INVOICE_TEXT_COLOR.slice(start, start + 2), 16) / 255) as [number, number, number]);

const headingInk = rgb(...[1, 3, 5].map(start => parseInt(INVOICE_HEADING_COLOR.slice(start, start + 2), 16) / 255) as [number, number, number]);

/** The only invoice renderer: used by preview, download, print, and PDF tests. */
export async function buildInvoicePdf(input: Invoice, backgroundBytes: Uint8Array): Promise<Uint8Array> {
    const invoice = invoiceSchema.parse(input);
    const pdf = await PDFDocument.create();
    pdf.setTitle(`Facture ${invoice.number}`);
    pdf.setAuthor(branding.doctor);
    let background;
    try {
        background = await pdf.embedPng(backgroundBytes);
        validateBackgroundDimensions(background.width, background.height);
    } catch (cause) {
        throw new Error(cause instanceof Error && cause.message.includes('ratio A4') ? cause.message : backgroundError);
    }
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    let pages, measured;
    try {
        regular.encodeText(invoice.number);
        regular.encodeText(invoice.patient);
        for (const value of Object.values(invoice.fiscal)) regular.encodeText(value || '');
        pages = planInvoice(invoice, regular, bold);
        measured = measureInvoice(invoice, regular, bold);
    } catch (cause) {
        if (cause instanceof Error && cause.message.includes('WinAnsi')) throw new Error('Le texte contient des caractères non pris en charge. Utilisez les caractères français pour les informations saisies.');
        throw cause;
    }
    const scale = Math.min(l.width / background.width, l.height / background.height);
    const imageWidth = background.width * scale;
    const imageHeight = background.height * scale;
    const text = (page: PDFPage, value: string, x: number, top: number, font: PDFFont = regular, size: number = l.fontSize, color = ink) => {
        page.drawText(value, { x, y: l.height - top - size, size, font, color });
    };
    const rightText = (page: PDFPage, value: string, top: number, font = regular, color = ink) => text(page, value, l.right - textWidth(value, font, l.fontSize), top, font, l.fontSize, color);
    const line = (page: PDFPage, top: number) => page.drawLine({ start: { x: l.left, y: l.height - top }, end: { x: l.right, y: l.height - top }, thickness: 0.5, color: ink });
    pages.forEach((planned, pageIndex) => {
        const page = pdf.addPage([l.width, l.height]);
        // Original background positioning and scale are intentionally unchanged.
        page.drawImage(background, { x: (l.width - imageWidth) / 2, y: (l.height - imageHeight) / 2, width: imageWidth, height: imageHeight });
        if (pageIndex === 0) {
            rightText(page, `Témara, le : ${displayDate(invoice.date)}`, l.dateTop, regular, headingInk);
            measured.title.forEach((value, i) => text(page, value, (l.left + l.right - textWidth(value, bold, 18)) / 2, l.titleTop + i * 22, bold, 18, headingInk));
            text(page, branding.invoiceDoctor, l.left, measured.informationTop, bold, 10);
            measured.address.forEach((value, i) => text(page, value, l.left, measured.informationTop + 16 + i * l.lineHeight, regular, 8.5));
            text(page, 'Patient :', measured.patientX, measured.informationTop, bold);
            measured.patient.forEach((value, i) => text(page, value, measured.patientX + measured.labelWidth, measured.informationTop + i * l.lineHeight));
        } else {
            const reference = wrapText(`Facture N° : ${invoice.number} — suite`, bold, l.fontSize, l.right-l.left);
            reference.forEach((value,i)=>text(page,value,l.left,l.contentTop+i*l.lineHeight,bold));
        }
        let x = l.left;
        ['DATE', 'DENTS', 'DESCRIPTION', 'PRIX'].forEach((value, i) => {
            const labelX = i === 2 ? x + l.cellPadding : x + (l.columns[i] - textWidth(value, bold, l.fontSize)) / 2;
            text(page, value, labelX, planned.tableTop + 6, bold);
            x += l.columns[i];
        });
        line(page, planned.tableTop);
        line(page, planned.tableTop + l.headingHeight);
        let top = planned.tableTop + l.headingHeight;
        for (const row of planned.rows) {
            x = l.left;
            row.cells.forEach((lines, i) => {
                lines.forEach((value, lineIndex) => {
                    const width = textWidth(value, regular, l.fontSize);
                    const cellX = i < 2 ? x + (l.columns[i] - width) / 2 : i === 3 ? x + l.columns[i] - l.cellPadding - width : x + l.cellPadding;
                    text(page, value, cellX, top + l.cellPadding + lineIndex * l.lineHeight);
                });
                x += l.columns[i];
            });
            top += row.height;
            line(page, top);
        }
        x = l.left;
        for (const width of [...l.columns, 0]) {
            page.drawLine({ start: { x, y: l.height - planned.tableTop }, end: { x, y: l.height - top }, thickness: 0.5, color: ink });
            x += width;
        }
        if (planned.totals) {
            top += 6;
            rightText(page, `TOTAL : ${currency(total(invoice))}`, top, bold);
            top += 18;
            measured.sentence.forEach((value, i) => text(page, value, l.left, top + i*l.lineHeight));
            top += measured.sentence.length*l.lineHeight+8;
            if (invoice.paid !== '') {
                rightText(page, `Montant payé : ${currency(cents(invoice.paid))}`, top);
                rightText(page, `Reste à payer : ${currency(balance(invoice))}`, top+16);
            }
            let fiscalTop: number = l.fiscalTop;
            for (const [label, value] of [['IF', invoice.fiscal.if], ['ICE', invoice.fiscal.ice], ['INPE', invoice.fiscal.inpe]]) {
                const prefix = `${label} : `;
                const labelWidth = textWidth(prefix, bold, l.fontSize);
                const lines = wrapText(value || '', regular, l.fontSize, l.fiscalWidth-labelWidth);
                if (fiscalTop+lines.length*l.lineHeight > l.bottom) throw new Error('Les identifiants professionnels dépassent la zone disponible. Vérifiez leur configuration.');
                text(page, prefix, l.left, fiscalTop, bold);
                lines.forEach((value,i)=>text(page,value,l.left+labelWidth,fiscalTop+i*l.lineHeight));
                fiscalTop += lines.length*l.lineHeight;
            }
        }
    });
    return pdf.save();
}

export async function generateInvoicePdf(invoice: Invoice): Promise<Blob> {
    const bytes = await buildInvoicePdf(invoice, await loadBackground());
    return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}
