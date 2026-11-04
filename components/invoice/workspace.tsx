/* eslint-disable react-hooks/refs -- handleSubmit invokes callbacks on user events, not during render. */
'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useForm, useFieldArray, useWatch, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Download, Printer, Eye, RotateCcw, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { branding } from '@/lib/invoice/branding';
import { Button } from '@/components/ui/button';
import { defaults, emptyRow, invoiceSchema, type Invoice, total, balance, currency, filename } from '@/lib/invoice/model';
export default function Workspace() {
    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<Invoice>({ resolver: zodResolver(invoiceSchema), defaultValues: defaults() });
    const { fields, append, remove } = useFieldArray({ control, name: 'treatments' });
    const values = useWatch({ control }) as Invoice;
    const [url, setUrl] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [snapshot, setSnapshot] = useState('');
    const preview = useRef<HTMLDivElement>(null);
    const frame = useRef<HTMLIFrameElement>(null);
    const currentUrl = useRef('');
    useEffect(() => () => { if (currentUrl.current)
        URL.revokeObjectURL(currentUrl.current); }, []);
    /* Refs below are only read from event handlers, never while rendering. */
    async function generate(data: Invoice, action: 'preview' | 'download' | 'print') { setBusy(true); setError(''); try {
        const { generateInvoicePdf } = await import('./document');
        const blob = await generateInvoicePdf(data);
        const next = URL.createObjectURL(blob);
        if (currentUrl.current)
            URL.revokeObjectURL(currentUrl.current);
        currentUrl.current = next;
        setUrl(next);
        setSnapshot(JSON.stringify(data));
        if (action === 'download') {
            const a = document.createElement('a');
            a.href = next;
            a.download = filename(data.number);
            a.click();
        }
        if (action === 'print') {
            const win = window.open(next, '_blank');
            if (win)
                win.addEventListener('load', () => win.print(), { once: true });
            else
                setError('Autorisez les fenêtres contextuelles ou utilisez le bouton d’impression dans l’aperçu.');
        }
        if (action === 'preview')
            preview.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    catch (cause) {
        setError(cause instanceof Error ? cause.message : 'La génération du PDF a échoué. Veuillez réessayer.');
    }
    finally {
        setBusy(false);
    } }
    const messages = (e: FieldErrors): string[] => Object.values(e).flatMap(v => v && typeof v === 'object' ? ('message' in v && typeof v.message === 'string' ? [v.message] : messages(v as FieldErrors)) : []);
    return <><header className="topbar"><div className="brand"><div className="brand-icon"><Image src={branding.logo} alt="Logo Cabinet Dentaire Dr Kaoutar Samghouli" width={46} height={46} className="brand-logo" priority /></div><div>Sijilmassa <span>Invoice</span><small>DR KAOUTAR SAMGHOULI</small></div></div><span className="privacy"><ShieldCheck size={16}/> Données conservées dans cet onglet uniquement</span></header>
 <main><div className="heading"><div><div className="eyebrow">SIJILMASSA DENTAL CENTER</div><h1>Nouvelle facture</h1><p>Vos soins, une facture claire. Simplement.</p></div><span className="badge">FACTURATION • DH</span></div>
 <div className="workspace"><form onSubmit={handleSubmit(d => generate(d, 'preview'))} noValidate><section className="card"><div className="section-title"><span>01</span><h2>Informations de la facture</h2></div><div className="fields"><label>Numéro de facture<input {...register('number')} placeholder="2026-001"/><small>Suggestion modifiable, sans garantie d’unicité.</small></label><label>Date de facturation<input type="date" {...register('date')}/></label><label className="full">Nom et prénom du patient<input {...register('patient')} placeholder="Saisir le nom complet du patient" autoComplete="off"/></label></div></section>
 <section className="card"><div className="section-title"><span>02</span><h2>Actes et traitements</h2><small>{fields.length} acte{fields.length > 1 ? 's' : ''}</small></div><div className="treatments">{fields.map((field, i) => <div className="treatment" key={field.id}><div className="row-title">ACTE {String(i + 1).padStart(2, '0')}<Button type="button" variant="ghost" disabled={fields.length === 1} onClick={() => remove(i)} aria-label={`Supprimer l’acte ${i + 1}`}><Trash2 size={15}/></Button></div><div className="row-fields"><label>Date<input aria-label={`Date de l’acte ${i + 1}`} type="date" {...register(`treatments.${i}.date`)}/></label><label>N° de dent <small>(facultatif)</small><input {...register(`treatments.${i}.tooth`)} placeholder="Ex. 16"/></label><label className="description">Désignation de l’acte<textarea {...register(`treatments.${i}.description`)} placeholder="Ex. Détartrage et polissage" rows={2}/></label><label>Prix (DH)<input inputMode="decimal" {...register(`treatments.${i}.price`)} placeholder="0,00"/></label></div></div>)}</div><Button variant="outline" type="button" disabled={fields.length >= 100} onClick={() => append(emptyRow())}><Plus size={16}/> Ajouter un acte</Button></section>
 <section className="card totals"><div><h2>Règlement</h2><label>Montant payé (DH) <small>Facultatif</small><input inputMode="decimal" {...register('paid')} placeholder="Non renseigné"/></label></div><div className="summary"><div>Total de la facture<strong>{currency(total(values))}</strong></div>{values.paid !== '' && <div>Reste à payer<strong>{currency(balance(values))}</strong></div>}<small>Montants en dirhams marocains</small></div></section>
 {Object.keys(errors).length > 0 && <div className="error" role="alert"><strong>Vérifiez les champs suivants :</strong><ul>{[...new Set(messages(errors))].map(m => <li key={m}>{m}</li>)}</ul></div>}{error && <p className="error" role="alert">{error}</p>}
 <div className="actions"><Button disabled={busy} type="submit"><Eye size={16}/>{busy ? 'Génération…' : 'Aperçu de la facture'}</Button><Button disabled={busy} variant="outline" type="button" onClick={handleSubmit(d => generate(d, 'download'))}><Download size={16}/>Télécharger le PDF</Button><Button disabled={busy} variant="outline" type="button" onClick={handleSubmit(d => generate(d, 'print'))}><Printer size={16}/>Imprimer</Button></div><Button className="reset" variant="ghost" type="button" onClick={() => { if (window.confirm('Effacer toutes les informations de cette facture ?')) {
        reset(defaults());
        setUrl('');
        setSnapshot('');
        setError('');
        if (currentUrl.current)
            URL.revokeObjectURL(currentUrl.current);
        currentUrl.current = '';
    } }}><RotateCcw size={14}/>Réinitialiser le formulaire</Button>
 </form><aside ref={preview} className="preview"><div className="preview-title"><h2>Aperçu du document</h2><span>A5 · PORTRAIT</span></div>{url ? <><p className="preview-status">{snapshot !== JSON.stringify(values) ? 'Modifications en cours : actualisez l’aperçu.' : 'Votre PDF est prêt.'} <a href={url} target="_blank" rel="noreferrer">Ouvrir <ArrowUpRight size={12}/></a></p><iframe ref={frame} title="Aperçu de la facture PDF" src={url}/></> : <div className="empty-preview"><p>Votre facture prend forme ici</p><small>Complétez les informations, puis cliquez sur « Aperçu de la facture ».</small></div>}<p className="local-note"><ShieldCheck size={15}/> Le PDF est créé sur votre appareil. Aucune donnée patient n’est enregistrée sur un serveur.</p></aside></div></main><footer className="app-footer">Sijilmassa Invoice <span>Un outil dédié à votre cabinet.</span></footer></>;
}
