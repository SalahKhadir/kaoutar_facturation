// @vitest-environment node
import { it, expect } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { measureInvoice, planInvoice, wrapText } from '../lib/invoice/pdf-layout';
import { validateBackgroundDimensions } from '../lib/invoice/background';
import { defaults } from '../lib/invoice/model';
import { CONTENT_TOP_OFFSET, invoiceLayout as l } from '../lib/invoice/branding';
it('mesure les mots, les glyphes et les sauts de ligne avec la police réellement utilisée', async () => {
    const pdf=await PDFDocument.create(); const font=await pdf.embedFont(StandardFonts.Helvetica);
    for(const source of ['Éléments avec accents, restauration et contrôle.', 'W'.repeat(200), 'ligne 1\nligne 2']) {
        const lines=wrapText(source,font,9,100);
        for(const line of lines) expect(font.widthOfTextAtSize(line,9)).toBeLessThanOrEqual(100);
    }
    expect(wrapText('ligne 1\nligne 2',font,9,100)).toEqual(['ligne 1','ligne 2']);
});
it('conserve tous les actes, sans chevauchement, avec les totaux uniquement à la fin', async () => {
    const pdf=await PDFDocument.create();const font=await pdf.embedFont(StandardFonts.Helvetica);
    for(const count of [1,3,10,15,20,30]) {
        const invoice={...defaults(),patient:'Test',paid:'1',treatments:Array.from({length:count},(_,i)=>({date:'2026-11-04',tooth:'',description:i%2 ? 'W'.repeat(700) : 'Traitement\navec suivi\nà prévoir',price:'15,25'}))};
        const pages=planInvoice(invoice,font);
        expect(pages.flatMap(p=>p.rows.map(r=>r.sourceIndex))).toEqual(Array.from({length:count},(_,i)=>i));
        expect(pages.filter(p=>p.totals)).toHaveLength(1);expect(pages.at(-1)?.totals).toBe(true);
        for(const page of pages) {
            expect(page.rows.length>0 || page.totals).toBe(true);
            const height=page.rows.reduce((sum,r)=>sum+r.height,0)+(page.totals?measureInvoice(invoice,font).totalsHeight:0);
            expect(page.tableTop+l.headingHeight+height).toBeLessThanOrEqual(page.totals?l.fiscalTop-12:l.bottom);
        }
    }
});
it('refuse une ligne physiquement trop haute plutôt que couper le texte',async()=>{
    const pdf=await PDFDocument.create();const font=await pdf.embedFont(StandardFonts.Helvetica);
    expect(()=>planInvoice({...defaults(),treatments:[{date:'2026-11-04',tooth:'',description:'Acte\n'.repeat(100),price:'1'}]},font)).toThrow('trop long');
});
it('rejette les fonds A5/paysage et les images insuffisantes',()=>{
    expect(()=>validateBackgroundDimensions(1414,2000)).not.toThrow();
    expect(()=>validateBackgroundDimensions(1000,700)).toThrow();
    expect(()=>validateBackgroundDimensions(100,141)).toThrow();
    expect(()=>validateBackgroundDimensions(2000,2000)).toThrow();
});
it('réserve deux colonnes et recule le tableau pour les noms longs',async()=>{
    const pdf=await PDFDocument.create();const font=await pdf.embedFont(StandardFonts.Helvetica);const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
    const invoice={...defaults(),patient:'W'.repeat(150)};
    const measured=measureInvoice(invoice,font,bold);
    expect(measured.patient.length).toBeGreaterThan(1);
    expect(measured.firstTableTop).toBeGreaterThanOrEqual(measured.informationTop+measured.patient.length*l.lineHeight+16);
    for(const line of measured.patient) expect(font.widthOfTextAtSize(line,l.fontSize)).toBeLessThanOrEqual((l.right-l.left-l.columnGap)/2-measured.labelWidth);
});

it('décale tout le bloc supérieur de 24 points sans déplacer les identifiants',()=>{
    expect(CONTENT_TOP_OFFSET).toBe(24);
    expect([l.dateTop,l.titleTop,l.informationTop,l.tableTop,l.contentTop,l.continuationTableTop]).toEqual([192,214,250,304,192,222].map(top=>top+24));
    expect(l.fiscalTop).toBe(660);expect(l.bottom).toBe(716);
});
