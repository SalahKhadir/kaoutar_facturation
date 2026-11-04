import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
    title: 'Sijilmassa Invoice — Nouvelle facture',
    description: 'Générateur de factures du Dr Kaoutar Samghouli',
    robots: { index: false, follow: false },
    icons: {
        icon: [
            { url: '/icon.png', type: 'image/png' },
            { url: '/favicon.ico', sizes: 'any' },
        ],
        apple: '/apple-icon.png',
    },
};
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="fr"><body>{children}</body></html>; }
