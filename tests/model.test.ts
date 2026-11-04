import { describe, it, expect } from 'vitest';
import { cents, lineTotal, total, balance, defaults, invoiceSchema, filename } from '../lib/invoice/model';
const valid = () => ({ ...defaults(), patient: 'Patient test', treatments: [{ date: '2026-11-04', tooth: '', description: 'Détartrage', price: '0,10' }] });
describe('monnaie et validation', () => {
    it('calcule en centimes sans erreur flottante', () => { expect(cents('12,34')).toBe(1234); expect(lineTotal(valid().treatments[0])).toBe(10); expect(total(valid())).toBe(10); expect(balance({ ...valid(), paid: '0,06' } )).toBe(4); });
    it('refuse plus de deux décimales plutôt que les arrondir silencieusement', () => { expect(invoiceSchema.safeParse({ ...valid(), paid: '0.001' }).success).toBe(false); expect(cents('0.29')).toBe(29); });
    it('accepte une dent facultative et un règlement absent', () => expect(invoiceSchema.safeParse(valid()).success).toBe(true));
    it.each([{ patient: '' }, { date: '2026-02-30' }, { paid: '1' }, { treatments: [] }, { treatments: [{ ...valid().treatments[0], price: '-1' }] }])('refuse des données incorrectes %j', patch => expect(invoiceSchema.safeParse({ ...valid(), ...patch }).success).toBe(false));
    it('nettoie les noms de fichiers', () => expect(filename('../a/b')).toBe('Facture____a_b.pdf'));
});
it('additionne plusieurs prix et conserve les centimes du règlement', () => {
    const invoice = { ...valid(), treatments: ['10,10','20.20','0,29'].map(price => ({...valid().treatments[0],price})), paid:'10,25' };
    expect(total(invoice)).toBe(3059);
    expect(balance(invoice)).toBe(2034);
    expect(Object.keys(invoiceSchema.parse(invoice).treatments[0]).sort()).toEqual(['date','description','price','tooth']);
});

it('valide les identifiants facultatifs sans conversion numérique',()=>{
    const input={...valid(),fiscal:{if:' 00012 ',ice:'001234567890123',inpe:''}};
    expect(invoiceSchema.parse(input).fiscal).toEqual({if:'00012',ice:'001234567890123',inpe:''});
    expect(invoiceSchema.parse({...valid(),fiscal:{}}).fiscal).toEqual({});
    expect(invoiceSchema.safeParse({...input,fiscal:{if:'X'.repeat(61)}}).success).toBe(false);
    expect(defaults().fiscal).toEqual({if:'',ice:'',inpe:''});
});
