// @vitest-environment node
import { it, expect } from 'vitest';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoiceDocument } from '../components/invoice/document';
import { defaults } from '../lib/invoice/model';
import { writeFileSync, mkdirSync } from 'node:fs';
it.each([1, 5, 15, 30])('génère une facture A4 avec %i actes', async (count) => { const invoice = { ...defaults(), patient: 'Patient de démonstration', treatments: Array.from({ length: count }, (_, i) => ({ date: '2026-11-04', tooth: i % 2 ? '16' : '', description: i % 3 === 0 ? 'Traitement conservateur avec restauration de la dent et contrôle de l’occlusion. Description détaillée pour vérifier le retour à la ligne et la lisibilité des caractères accentués.' : 'Détartrage et polissage', quantity: '1', price: '450,50' })) }; const buffer = await renderToBuffer(<InvoiceDocument invoice={invoice}/>); expect(buffer.subarray(0, 4).toString()).toBe('%PDF'); mkdirSync('/tmp/sijilmassa-pdfs', { recursive: true }); writeFileSync(`/tmp/sijilmassa-pdfs/${count}.pdf`, buffer); }, 30000);
