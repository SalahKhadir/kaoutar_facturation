import { branding, invoiceLayout } from './branding';

export const backgroundError = `Fond de facture absent ou invalide : ${branding.background}. Ajoutez le fond A5 original vierge au format PNG. Aucun modèle de remplacement n’est utilisé.`;

export function validateBackgroundDimensions(width: number, height: number) {
    const ratio = invoiceLayout.width / invoiceLayout.height;
    if (width < 1000 || height < 1418 || Math.abs(width / height - ratio) > 0.0008) {
        throw new Error(`${backgroundError} Le fond doit être au ratio A5 et mesurer au moins 1000 × 1418 pixels (1748 × 2480 recommandé).`);
    }
}

export async function loadBackground(): Promise<Uint8Array> {
    try {
        const response = await fetch(branding.background, { cache: 'no-store' });
        if (!response.ok) throw new Error(backgroundError);
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (bytes[0] !== 137 || String.fromCharCode(...bytes.slice(1, 4)) !== 'PNG') throw new Error(backgroundError);
        return bytes;
    } catch {
        throw new Error(backgroundError);
    }
}
