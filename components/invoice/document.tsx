/* PDF Image primitives have no HTML alt attribute. */
/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { branding as b } from '@/lib/invoice/branding';
import { type Invoice, total, balance, cents, currency, lineTotal, displayDate } from '@/lib/invoice/model';
const s = StyleSheet.create({ page: { paddingTop: 170, paddingBottom: 85, paddingHorizontal: 38, fontFamily: 'Helvetica', fontSize: 9, color: '#292429' }, header: { position: 'absolute', top: 32, left: 38, right: 38, height: 110, borderBottomWidth: 2, borderColor: b.primary }, doctor: { fontSize: 21, color: b.primary, marginBottom: 7 }, muted: { fontSize: 9, color: '#686068', lineHeight: '13pt' }, title: { fontSize: 25, color: b.primary, marginBottom: 14 }, details: { marginBottom: 20, lineHeight: '16pt' }, row: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#e0d5d9', paddingVertical: 9 }, thead: { flexDirection: 'row', backgroundColor: b.primary, color: 'white', paddingVertical: 9 }, cell: { paddingHorizontal: 5 }, totals: { marginTop: 20, marginLeft: 260, padding: 14, backgroundColor: '#f6eff1', lineHeight: '16pt' }, footer: { position: 'absolute', bottom: 26, left: 38, right: 38, borderTopWidth: 1, borderColor: b.primary, paddingTop: 10, textAlign: 'center', color: b.primary, fontSize: 8, lineHeight: '13pt' }, stamp: { marginTop: 25, textAlign: 'right', color: '#686068' }, watermark: { position: 'absolute', top: 280, left: 175, width: 245, opacity: 0.05 } });
const widths = ['14%', '10%', '34%', '8%', '17%', '17%'];
export function InvoiceDocument({ invoice }: {
    invoice: Invoice;
}) {
    const groups: Invoice['treatments'][] = [[]];
    let used = 0;
    for (const row of invoice.treatments) {
        const height = Math.max(36, Math.ceil(row.description.length / 28) * 12 + 20);
        if (used + height > 360 && groups[groups.length - 1].length) { groups.push([]); used = 0; }
        groups[groups.length - 1].push(row); used += height;
    }
    return <Document title={`Facture ${invoice.number}`} author={b.doctor} language="fr">{groups.map((rows, pageIndex) => <Page key={pageIndex} size="A4" style={s.page} wrap>
    <View fixed style={s.header}>{b.headerImage ? <Image src={b.headerImage} style={{ width: '100%', height: 105, objectFit: 'contain' }}/> : <><Text style={s.doctor}>{b.doctor}</Text><Text style={{ color: b.primary, fontSize: 12, marginBottom: 5 }}>{b.profession} · {b.clinic}</Text><Text style={s.muted}>{b.qualification}</Text><Text style={{ ...s.muted, fontSize: 7, marginTop: 5 }}>Maquette provisoire · En-tête original et logo à fournir</Text></>}</View>
    {b.watermarkImage && <Image fixed src={b.watermarkImage} style={s.watermark}/>}
    <Text style={s.title}>FACTURE</Text><View style={s.details}><Text>N° {invoice.number}                         Date : {displayDate(invoice.date)}</Text><Text>Nom et prénom du patient : {invoice.patient}</Text></View>
    <View fixed style={s.thead}>{['Date', 'N° dent', 'Désignation', 'Qté', 'Prix unitaire', 'Montant'].map((label, i) => <Text key={label} style={{ ...s.cell, width: widths[i] }}>{label}</Text>)}</View>
    {rows.map((row, index) => <View key={index} wrap={false} style={s.row}>{[displayDate(row.date), row.tooth || '—', row.description.replace(/\s+/g, ' '), row.quantity, currency(cents(row.price)), currency(lineTotal(row))].map((v, i) => <Text key={i} style={{ ...s.cell, width: widths[i], lineHeight: '12pt' }}>{v}</Text>)}</View>)}
    {pageIndex === groups.length - 1 && <View wrap={false}><View style={s.totals}><Text>Total de la facture : {currency(total(invoice))}</Text>{invoice.paid !== '' && <><Text>Montant payé : {currency(cents(invoice.paid))}</Text><Text>Reste à payer : {currency(balance(invoice))}</Text></>}</View><Text style={s.stamp}>Signature et cachet</Text></View>}
    <View fixed style={s.footer}><Text>{b.address}</Text><Text>{b.phones}</Text><Text>Page {pageIndex+1} / {groups.length}</Text></View>
    </Page>)}</Document>;
}
