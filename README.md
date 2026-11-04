# Sijilmassa Invoice

Générateur de factures en français du Dr Kaoutar Samghouli. Application Next.js/TypeScript, React Hook Form/Zod, Tailwind et composants shadcn/ui. Aucun backend, secret ou base de données.

## Installation

Node.js 22 LTS, pnpm 12.6.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm start
```

Ouvrir http://localhost:3000. Utiliser le verrouillage pnpm pour les installations et Vercel.

## Facturation

Chaque acte comprend une date, un numéro de dent facultatif, une désignation et un prix (DH). Le total est la somme des prix, calculée en centimes entiers. Le règlement est facultatif et ne peut dépasser le total. Saisie décimale française acceptée, deux décimales maximum ; aucune règle de TVA ajoutée. Numéro proposé modifiable, sans garantie d’unicité. Jusqu’à 100 actes, descriptions de 700 caractères maximum.

L’aperçu affiche le PDF réellement généré. Après modification, actualiser l’aperçu. Téléchargement et impression utilisent exactement la même fonction `generateInvoicePdf`. Sur mobile ou si l’impression automatique est bloquée, ouvrir le PDF et utiliser la commande d’impression du lecteur. Aucun modèle HTML de facture parallèle.

## Fond original et zone imprimable

`references/facture-reference.png` a été inspecté visuellement : c’est une papeterie vierge, sans données patient. Son export Canva mesure **1414 × 2000 pixels**, ratio A4, environ **171 DPI**. Il est copié sans modification dans `public/branding/facture-bg.png` (mêmes octets). Le logo, le texte arabe, l’en-tête, le filigrane et les coordonnées restent exclusivement dans ce fichier. Les PDF A5 d’ordonnance et de dossier patient ainsi que la carte de visite sont des références ; ils ne servent jamais de fond.

`lib/invoice/branding.ts` configure le chemin local et les coordonnées en points, avec origine en haut à gauche : A4 595,28 × 841,89 ; en-tête original jusqu’à environ 176 ; contenu à partir de 216 ; date à droite à 216 ; titre centré à 238 ; informations médecin/patient à 274 ; tableau au minimum à 328, ajusté aux retours à la ligne ; limites horizontales 40–555,28 ; contenu jusqu’à 716 ; pied original à partir d’environ 737. Une marge de sécurité de 21 points sépare la zone principale du pied. Aucune numérotation de page n’est imprimée. Le décalage supérieur est centralisé dans `CONTENT_TOP_OFFSET` (24 points), et la couleur noire des textes et bordures dans `INVOICE_TEXT_COLOR` (`#000000`). Seuls le titre principal et la date utilisent `INVOICE_HEADING_COLOR` (`#5e0b1b`). Les quatre largeurs de colonnes sont configurables.

Le fond est intégré une seule fois comme image PDF et réutilisé sur chaque page, avant tout texte. Son placement utilise un facteur d’échelle uniforme et un centrage : aucun recadrage ni étirement. Pas d’autre logo, pied de page, filigrane ou habillage. L’image reste à sa résolution native, sans recompression destructive. Un export original PNG de **2480 × 3508 pixels** ou un original vectoriel améliorerait la netteté ; la version actuelle fonctionne mais n’est pas un export 300 DPI. Ne pas agrandir artificiellement le PNG pour simuler cette résolution.

Pour changer le fond : remplacer le PNG par un export vierge original de même disposition. Le chargement et le décodage vérifient le format, le ratio A4 et une résolution minimale de 1200 × 1690 pixels. Une erreur explicite bloque le PDF si le fichier manque ou est invalide : aucun remplacement automatique. Toute nouvelle disposition exige de recalibrer les constantes et de vérifier toutes les pages avant utilisation. N’utiliser ni capture de facture remplie ni URL d’image tierce.

## Rendu et pagination

`components/invoice/document.tsx` utilise **pdf-lib**, bibliothèque compatible navigateur. Le moteur React PDF précédent et son découpage approximatif ont été remplacés pour maîtriser le placement sur la papeterie.

`lib/invoice/pdf-layout.ts` mesure chaque mot avec les métriques exactes de la police Helvetica intégrée. Il préserve les sauts de ligne et coupe les mots trop larges selon les avances réelles des glyphes. Le nombre exact de lignes fixe la hauteur de chaque cellule et de chaque acte. Les lignes entières sont placées tant qu’elles tiennent dans la zone ; sinon une page A4 identique est créée. Le tableau bordé à quatre colonnes est répété. Le titre centré et les deux colonnes médecin/patient sont réservés à la première page ; une référence compacte est utilisée sur les suivantes. Les prix sont alignés à droite, les dates et dents sont centrées ; toutes les cellules ont des bordures fines sans fond coloré.

Les totaux et la somme en lettres restent groupés sur la dernière page avec un espace vierge de 42 points pour le cachet ou la signature. Les dernières lignes sont rééquilibrées vers cette page quand elles peuvent accompagner le total. La somme en français est calculée en centimes entiers par `lib/invoice/amount-words.ts`, avec accords des centaines, milliers, millions, dirhams et centimes ; zéro et les grands montants sont couverts par les tests. Si un acte est trop haut pour accompagner les totaux, une page finale dédiée reste possible ; elle contient la référence de facture, les totaux et les identifiants, jamais une page vide. Aucune estimation par nombre de caractères. Un acte dont les retours à la ligne le rendent physiquement plus haut que toute la zone est refusé avec une erreur explicite : le texte n’est jamais tronqué ou partagé silencieusement.

Les données dynamiques acceptent les caractères français compatibles avec Helvetica/WinAnsi. L’arabe de la papeterie est préservé dans l’image ; les noms saisis dans d’autres alphabets nécessiteraient l’intégration d’une police Unicode adaptée.

## Tests

`tests/model.test.ts` vérifie la monnaie, les sommes, le paiement et la validation. `tests/workspace.test.tsx` vérifie l’ajout et la suppression. `tests/layout.test.ts` vérifie les mesures réelles, les longues descriptions, la conservation des actes et la réservation des totaux. `tests/pdf.test.tsx` produit 1, 3, 10, 15, 20 et 30 actes fictifs, contrôle les dimensions A4 et la présence du fond sur chaque page. Les PDF sont écrits dans `/tmp/sijilmassa-pdfs` pour inspection avec Poppler (`pdfinfo`, `pdftoppm`, `pdftotext`).

## Confidentialité et limites

Pas d’authentification, stockage automatique, analytics, API de conversion ou transmission des données patient. Tout reste dans la mémoire de l’onglet jusqu’à fermeture/rechargement. Seul le fond local statique est chargé via HTTP ; le PDF est produit sur l’appareil. Pas de données patient dans les URL, localStorage ou sessionStorage.

Ce MVP n’est pas un système sécurisé de gestion des patients. Une URL Vercel non répertoriée n’est pas privée. Configurer une protection d’accès adaptée avant utilisation clinique. Le cabinet reste responsable des fichiers téléchargés, impressions, exigences légales et comptables. Aucune conformité réglementaire n’est revendiquée.

## Vercel

Importer le dépôt Git dans Vercel, preset Next.js, Node.js 22. Installation : `pnpm install --frozen-lockfile` ; build : `pnpm build` ; sortie Next.js standard. Aucune variable d’environnement. Le dossier `public/branding` doit être inclus dans le dépôt. Configurer l’accès puis tester aperçu, téléchargement et impression A4 dans les navigateurs du cabinet. Aucun déploiement n’est lancé automatiquement.

## Identifiants professionnels

Saisir IF, ICE et INPE dans la section « Informations fiscales » du formulaire. Les trois champs sont facultatifs, vides par défaut et limités à 60 caractères, sans validation de format non confirmée. Les espaces externes sont supprimés et les zéros initiaux conservés. Ces valeurs appartiennent à `invoice.fiscal` et sont communes à l’aperçu, au téléchargement et à l’impression. La réinitialisation efface les trois champs ; aucune persistance n’est ajoutée. Les labels sont imprimés en bas à gauche sur la dernière page (à partir de 660 points, sous le filigrane, avant le pied). Aucun identifiant tiers ou fictif n’est utilisé en production. Le panneau d’aperçu de l’application signale les valeurs manquantes : un PDF incomplet ne doit pas être considéré comme juridiquement finalisé. Les valeurs trop longues pour cette zone bloquent la génération au lieu de déborder.
