import { z } from 'zod';
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide').refine(v => !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v, 'Date invalide');
const money = z.string().regex(/^\d{1,7}([.,]\d{1,2})?$/, 'Saisissez un montant positif, avec deux décimales maximum');
export const invoiceSchema = z.object({
    number: z.string().trim().min(1, 'Numéro requis').max(60, 'Maximum 60 caractères pour le numéro'), date,
    patient: z.string().trim().min(1, 'Nom du patient requis').max(150, 'Maximum 150 caractères pour le nom'),
    paid: z.union([z.literal(''), money]),
    treatments: z.array(z.object({ date, tooth: z.string().max(30, 'Maximum 30 caractères pour les dents'), description: z.string().trim().min(1, 'Désignation requise').max(700, 'Maximum 700 caractères'), quantity: z.string().regex(/^\d{1,3}$/, 'Quantité entière de 1 à 999').refine(v => Number(v) > 0, 'Quantité minimale : 1'), price: money })).min(1, 'Ajoutez un acte').max(100, 'Maximum 100 actes'),
}).superRefine((v, ctx) => { if (v.paid && cents(v.paid) > total(v))
    ctx.addIssue({ code: 'custom', path: ['paid'], message: 'Le montant payé dépasse le total' }); });
export type Invoice = z.infer<typeof invoiceSchema>;
export function cents(value: string): number { if (!/^\d{1,7}([.,]\d{1,2})?$/.test(value))
    return 0; const [whole, fraction = ''] = value.replace(',', '.').split('.'); return Number(whole) * 100 + Number(fraction.padEnd(2, '0')); }
export function lineTotal(row: Invoice['treatments'][number]) { return cents(row.price) * (/^\d{1,3}$/.test(row.quantity) ? Number(row.quantity) : 0); }
export function total(invoice: Invoice) { return invoice.treatments.reduce((sum, row) => sum + lineTotal(row), 0); }
export function balance(invoice: Invoice) { return Math.max(0, total(invoice) - cents(invoice.paid)); }
export const currency = (minor: number) => new Intl.NumberFormat('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(minor / 100) + ' DH';
export const displayDate = (value: string) => value.split('-').reverse().join('/');
export const filename = (value: string) => `Facture_${value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60) || 'sans_numero'}.pdf`;
export function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
export const emptyRow = () => ({ date: today(), tooth: '', description: '', quantity: '1', price: '' });
export const defaults = (): Invoice => ({ number: `${new Date().getFullYear()}-001`, date: today(), patient: '', paid: '', treatments: [emptyRow()] });
