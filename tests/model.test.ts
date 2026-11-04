import { describe, it, expect } from 'vitest';
import { cents, lineTotal, total, balance, defaults, invoiceSchema, filename } from '../lib/invoice/model';
const valid = () => ({ ...defaults(), patient: 'Patient test', treatments: [{ date: '2026-11-04', tooth: '', description: 'Détartrage', quantity: '3', price: '0,10' }] });
describe('monnaie et validation', () => {
    it('calcule en centimes sans erreur flottante', () => { expect(cents('12,34')).toBe(1234); expect(lineTotal(valid().treatments[0])).toBe(30); expect(total(valid())).toBe(30); expect(balance({ ...valid(), paid: '0,20' })).toBe(10); });
    it('refuse plus de deux décimales plutôt que les arrondir silencieusement', () => { expect(invoiceSchema.safeParse({ ...valid(), paid: '0.001' }).success).toBe(false); expect(cents('0.29')).toBe(29); });
    it('accepte une dent facultative et un règlement absent', () => expect(invoiceSchema.safeParse(valid()).success).toBe(true));
    it.each([{ patient: '' }, { date: '2026-02-30' }, { paid: '1' }, { treatments: [] }, { treatments: [{ ...valid().treatments[0], price: '-1' }] }, { treatments: [{ ...valid().treatments[0], quantity: '0' }] }, { treatments: [{ ...valid().treatments[0], quantity: '1.2' }] }])('refuse des données incorrectes %j', patch => expect(invoiceSchema.safeParse({ ...valid(), ...patch }).success).toBe(false));
    it('nettoie les noms de fichiers', () => expect(filename('../a/b')).toBe('Facture____a_b.pdf'));
});
