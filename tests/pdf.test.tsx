// @vitest-environment node
import { it, expect } from 'vitest';
import { PDFDocument, PDFName, PDFDict, PDFArray, PDFRawStream, decodePDFRawStream } from 'pdf-lib';
import { buildInvoicePdf } from '../components/invoice/document';
import { defaults } from '../lib/invoice/model';
import { branding, INVOICE_TEXT_COLOR, INVOICE_HEADING_COLOR, INVOICE_TABLE_HEADER_BG, invoiceLayout as l } from '../lib/invoice/branding';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const background = new Uint8Array(readFileSync('public/branding/facture_background.png'));
it.each([1, 3, 5, 10, 15, 20, 30])('produit %i actes avec fond sur chaque page A5', async count => {
    const invoice = { ...defaults(), number: '2026-003', date: '2026-11-04', patient: count===5 ? 'Patient de démonstration avec un nom composé particulièrement long et plusieurs prénoms pour tester les retours à la ligne' : 'KHADIR Salah', paid: '100,25', treatments: Array.from({ length: count }, (_, i) => ({ date: '2026-11-04', tooth: i % 2 ? '16' : '', description: `${i+1}. ` + (i % 3 === 0 ? 'Traitement conservateur avec restauration de la dent et contrôle de l’occlusion. Description détaillée pour vérifier les retours à la ligne et les caractères accentués.\nContrôle après traitement.' : 'Détartrage et polissage'), price: '450,50' })) };
    const bytes = await buildInvoicePdf(invoice, background);
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(1);
    for (const page of pdf.getPages()) {
        expect(page.getWidth()).toBe(l.width); expect(page.getHeight()).toBe(l.height);
        const resources = page.node.Resources()!;
        const images = resources.lookup(PDFName.of('XObject'), PDFDict);
        expect(images.keys()).toHaveLength(1);
        const stream = pdf.context.lookup(images.get(images.keys()[0]));
        expect(String(stream)).toContain('/Width 1410');
        expect(String(stream)).toContain('/Height 2000');
    }
    mkdirSync('/tmp/sijilmassa-pdfs', { recursive: true });
    writeFileSync(`/tmp/sijilmassa-pdfs/${count}.pdf`, bytes);
});
it('refuse un fond absent ou invalide sans remplacement', async () => {
    await expect(buildInvoicePdf({ ...defaults(), patient: 'Test', treatments: [{date:'2026-11-04',tooth:'',description:'Acte',price:'10'}]}, new Uint8Array())).rejects.toThrow('Fond de facture absent ou invalide');
});
it.each(['0','100','300,99','9999999,99'])('génère les variantes monétaires %s et les textes longs',async price=>{
    const invoice={...defaults(),number:'2026-003',patient:'W'.repeat(150),paid:'',treatments:[{date:'2026-11-04',tooth:'',description:'Traitement conservateur avec restauration et contrôle de la dent. '.repeat(10),price}]};
    const bytes=await buildInvoicePdf(invoice,background);
    expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(0);
    writeFileSync(`/tmp/sijilmassa-pdfs/amount-${price}.pdf`,bytes);
});

it('imprime les identifiants permanents et préserve les zéros initiaux',async()=>{
    const invoice={...defaults(),patient:'Patient test',treatments:[{date:'2026-11-04',tooth:'',description:'Contrôle',price:'100'}]};
    const bytes=await buildInvoicePdf(invoice,background);
    writeFileSync('/tmp/sijilmassa-pdfs/permanent-fiscal.pdf',bytes);
    const pdf=await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(1);
    const font=await pdf.embedFont('Helvetica');
    const contents=pdf.getPage(0).node.lookup(PDFName.of('Contents'),PDFArray);
    const operators=contents.asArray().map(ref=>{const stream=pdf.context.lookup(ref);if(!(stream instanceof PDFRawStream)) throw new Error('Flux PDF attendu');return Buffer.from(decodePDFRawStream(stream).decode()).toString();}).join('\n');
    for(const value of Object.values(branding.fiscal)) expect(operators).toContain(font.encodeText(value).toString());
    expect(operators).not.toContain('5061676520'); // encoded "Page "
    const colors=Array.from(operators.matchAll(/([\d.]+) ([\d.]+) ([\d.]+) (rg|RG)/g));
    expect(colors.length).toBeGreaterThan(10);
    const expected=[1,3,5].map(start=>parseInt(INVOICE_TEXT_COLOR.slice(start,start+2),16)/255);
    const heading=[1,3,5].map(start=>parseInt(INVOICE_HEADING_COLOR.slice(start,start+2),16)/255);
    const headerBg=[1,3,5].map(start=>parseInt(INVOICE_TABLE_HEADER_BG.slice(start,start+2),16)/255);
    const accents=colors.filter(color=>heading.every((value,i)=>Math.abs(Number(color[i+1])-value)<1e-10));
    expect(accents).toHaveLength(2); // Date and main invoice title only.
    const tableHeaders=colors.filter(color=>headerBg.every((value,i)=>Math.abs(Number(color[i+1])-value)<1e-10));
    expect(tableHeaders).toHaveLength(1); // Table header background fill.
    for(const color of colors.filter(color=>!accents.includes(color) && !tableHeaders.includes(color))) for(let i=0;i<3;i++) expect(Number(color[i+1])).toBeCloseTo(expected[i],10);
});
