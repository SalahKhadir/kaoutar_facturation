import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Sijilmassa Invoice — Nouvelle facture', description: 'Générateur de factures du Dr Kaoutar Samghouli', robots: { index: false, follow: false } };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="fr"><body>{children}</body></html>; }
