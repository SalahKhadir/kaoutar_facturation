# Sijilmassa Invoice

Générateur de factures en français pour Dr Kaoutar Samghouli, Sijilmassa Dental Center, Témara. Next.js App Router, TypeScript strict, Tailwind, bouton shadcn/ui (Radix/CVA), React Hook Form/Zod, Lucide et @react-pdf/renderer.

## Installation et commandes

Node.js 22 LTS et pnpm 12.6.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm start
```

Ouvrir http://localhost:3000. Aucun secret ni service externe requis. Utiliser pnpm et le fichier pnpm-lock.yaml.

## Utilisation

Renseigner le patient et les actes, puis générer l’aperçu. Le même composant produit l’aperçu, le téléchargement et le document imprimable A4. Après modification, actualiser l’aperçu. Le navigateur doit pouvoir afficher les PDF ; sur mobile, ouvrir le PDF dans un nouvel onglet si nécessaire. Le bouton Imprimer ouvre le PDF ; utiliser la commande d’impression du lecteur si le navigateur ne lance pas automatiquement la boîte de dialogue.

Dates locales, prix positifs à deux décimales maximum, quantités entières de 1 à 999. Les calculs se font en centimes entiers. Les décimales supplémentaires sont refusées, sans arrondi silencieux. Paiement facultatif, limité au total. Pas de TVA. Numéro proposé modifiable sans garantie d’unicité. Maximum 100 actes ; descriptions limitées à 700 caractères pour conserver des lignes imprimables. Réinitialisation avec confirmation.

## Identité visuelle : éléments manquants

Les fichiers Ordonnance_Kaoutar_A5.pdf, carte_visite_Kaoutar.pdf, Dossier_Patient_Kaoutar_A5.pdf et les références de facture ne sont pas présents dans le dépôt. Le logo, le filigrane et le texte arabe original sont donc absents. Le PDF indique explicitement que son en-tête est provisoire. Aucun logo de substitution ou texte arabe inventé. La couleur bordeaux est provisoire, en attente de comparaison aux originaux.

Centralisation : `lib/invoice/branding.ts`. Placer les exports PNG haute résolution de l’en-tête bilingue complet et du filigrane dans `public/branding/`, puis renseigner `headerImage` et `watermarkImage` avec leurs chemins (`/branding/header.png`). Conserver les proportions et le texte arabe dans l’image originale ; ne pas le retaper. Le cadre d’en-tête est de 519 × 105 points : adapter le layout à l’original dans `components/invoice/document.tsx`. Vérifier toutes les pages et les impressions après remplacement. Les coordonnées du pied de page proviennent du cahier des charges ; leur arrangement original reste à confirmer.

## Architecture

- `components/invoice/workspace.tsx` : formulaire, lignes dynamiques, aperçu et actions locales.
- `components/invoice/document.tsx` : document PDF commun, en-tête/pied fixes, lignes insécables, en-tête de tableau répété, pagination conservatrice par groupes d’actes et totaux groupés.
- `lib/invoice/model.ts` : types dérivés de Zod, validation, dates et calculs monétaires.
- `lib/invoice/branding.ts` : coordonnées et visuels.
- `components/ui/button.tsx` : primitive shadcn/ui adaptée.
- `tests/` : calculs, validation, ajout/suppression et génération PDF pour 1, 5, 15 et 30 actes. Les PDF de test contiennent uniquement des données fictives et sont écrits dans `/tmp/sijilmassa-pdfs`.

## Confidentialité et limites

Aucune base de données, authentification, sauvegarde automatique, télémétrie ou API PDF. Les informations restent en mémoire dans l’onglet ; fermer/recharger la page les efface. Les PDF téléchargés et les impressions demeurent sous la responsabilité du cabinet. Les images de marque doivent être locales, jamais des URL tierces. Pas de données patient dans les URL, ni localStorage/sessionStorage. La génération est déclenchée dans le navigateur et les polices PDF standard n’appellent pas de service de polices.

Ce MVP sans authentification n’est pas un système sécurisé de gestion des patients. Une URL Vercel non répertoriée n’est pas privée. Activer une protection d’accès adaptée au déploiement avant l’usage clinique ; confirmer les exigences du cabinet. Aucune garantie de conformité réglementaire ou comptable n’est revendiquée. Pas d’identifiants légaux inventés. La reproduction fidèle de la papeterie dépend encore des originaux manquants.

## Déploiement Vercel

1. Pousser le dépôt vers un fournisseur Git puis importer le projet dans Vercel.
2. Choisir le preset Next.js et Node.js 22 ; utiliser `pnpm install --frozen-lockfile` et `pnpm build` (sortie Next.js par défaut).
3. Aucune variable d’environnement nécessaire.
4. Déployer, configurer l’accès, puis vérifier sur les navigateurs utilisés par le cabinet : aperçu PDF, téléchargement et impression A4 de 1, 5, 15 et 30 actes.

L’application fonctionne sans backend ; aucun déploiement Vercel n’est créé automatiquement par ce dépôt.

Le moteur PDF et ses composants internes sont verrouillés dans `pnpm-workspace.yaml` : leur mise à jour exige une nouvelle inspection visuelle de toutes les pages.
