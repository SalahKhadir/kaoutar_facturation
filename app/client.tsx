'use client';
import dynamic from 'next/dynamic';
const Workspace = dynamic(() => import('@/components/invoice/workspace'), { ssr: false, loading: () => <main aria-busy="true">Chargement du formulaire…</main> });
export default function Client() { return <Workspace />; }
