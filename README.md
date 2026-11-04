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

Le fond actif est `public/branding/facture_background.png` (underscore), un original vierge A5 de **1410 × 2000 pixels**, soit environ **242 DPI** à 148 × 210 mm. Le logo, le texte arabe, le filigrane et le pied sont intégrés dans cette image. Le fichier est utilisé sans modification des pixels, sans recadrage ni étirement, avec une échelle uniforme et un centrage sur chaque page. Un export 1748 × 2480 pixels correspondrait à environ 300 DPI. Les autres références ne servent pas de fond.

`lib/invoice/branding.ts` centralise les coordonnées A5 **419,53 × 595,28 points**. L’en-tête finit vers 124 points, la date et le contenu commencent à 145, le titre à 164 et les deux colonnes à 199. Le tableau commence au minimum à 245 sur la première page et à 170 sur les suivantes. Ses colonnes mesurent 56, 40, 205,53 et 70 points. La taille du texte du tableau est de 8,5 points, avec un interligne de 10,5 points. La zone principale finit à 518, avec 11 points de sécurité avant le pied original situé vers 529. Les identifiants commencent à 486 sur la dernière page, et les totaux restent au-dessus de ce bloc. Les couleurs et la hiérarchie typographique existantes sont conservées.

Le chargement vérifie un PNG au ratio A5 (148/210, tolérance 0,0008), au moins 1000 × 1418 pixels. Un fond absent, invalide ou d’un ancien ratio est refusé avec une erreur française. Toute nouvelle disposition exige une vérification des coordonnées et des pages imprimées.

Pour imprimer, choisir **papier A5 portrait, taille réelle / 100 %**, dans le lecteur PDF ou le dialogue du navigateur. L’application produit directement des pages A5, sans appliquer de mise à l’échelle d’impression.

## Rendu et pagination

`components/invoice/document.tsx` utilise **pdf-lib**, bibliothèque compatible navigateur. Le moteur React PDF précédent et son découpage approximatif ont été remplacés pour maîtriser le placement sur la papeterie.

`lib/invoice/pdf-layout.ts` mesure chaque mot avec les métriques exactes de la police Helvetica intégrée. Il préserve les sauts de ligne et coupe les mots trop larges selon les avances réelles des glyphes. Le nombre exact de lignes fixe la hauteur de chaque cellule et de chaque acte. Les lignes entières sont placées tant qu’elles tiennent dans la zone ; sinon une page A5 identique est créée. Le tableau bordé à quatre colonnes est répété. Le titre centré et les deux colonnes médecin/patient sont réservés à la première page ; une référence compacte est utilisée sur les suivantes. Les prix sont alignés à droite, les dates et dents sont centrées ; toutes les cellules ont des bordures fines avec un fond gris discret pour l’en-tête.

Les totaux et la somme en lettres restent groupés sur la dernière page avec un espace vierge de 20 points pour le cachet ou la signature. Les dernières lignes sont rééquilibrées vers cette page quand elles peuvent accompagner le total. La somme en français est calculée en centimes entiers par `lib/invoice/amount-words.ts`, avec accords des centaines, milliers, millions, dirhams et centimes ; zéro et les grands montants sont couverts par les tests. Si un acte est trop haut pour accompagner les totaux, une page finale dédiée reste possible ; elle contient la référence de facture, les totaux et les identifiants, jamais une page vide. Aucune estimation par nombre de caractères. Un acte dont les retours à la ligne le rendent physiquement plus haut que toute la zone est refusé avec une erreur explicite : le texte n’est jamais tronqué ou partagé silencieusement.

Les données dynamiques acceptent les caractères français compatibles avec Helvetica/WinAnsi. L’arabe de la papeterie est préservé dans l’image ; les noms saisis dans d’autres alphabets nécessiteraient l’intégration d’une police Unicode adaptée.

## Tests

`tests/model.test.ts` vérifie la monnaie, les sommes, le paiement et la validation. `tests/workspace.test.tsx` vérifie l’ajout et la suppression. `tests/layout.test.ts` vérifie les mesures réelles, les longues descriptions, la conservation des actes et la réservation des totaux. `tests/pdf.test.tsx` produit 1, 3, 10, 15, 20 et 30 actes fictifs, contrôle les dimensions A5 et la présence du fond sur chaque page. Les PDF sont écrits dans `/tmp/sijilmassa-pdfs` pour inspection avec Poppler (`pdfinfo`, `pdftoppm`, `pdftotext`).

## Confidentialité et limites

Pas d’authentification, stockage automatique, analytics, API de conversion ou transmission des données patient. Tout reste dans la mémoire de l’onglet jusqu’à fermeture/rechargement. Seul le fond local statique est chargé via HTTP ; le PDF est produit sur l’appareil. Pas de données patient dans les URL, localStorage ou sessionStorage.

Ce MVP n’est pas un système sécurisé de gestion des patients. Une URL Vercel non répertoriée n’est pas privée. Configurer une protection d’accès adaptée avant utilisation clinique. Le cabinet reste responsable des fichiers téléchargés, impressions, exigences légales et comptables. Aucune conformité réglementaire n’est revendiquée.

## Vercel

Importer le dépôt Git dans Vercel, preset Next.js, Node.js 22. Installation : `pnpm install --frozen-lockfile` ; build : `pnpm build` ; sortie Next.js standard. Aucune variable d’environnement. Le dossier `public/branding` doit être inclus dans le dépôt. Configurer l’accès puis tester aperçu, téléchargement et impression A5 dans les navigateurs du cabinet. Aucun déploiement n’est lancé automatiquement.

## Identifiants professionnels

Les valeurs permanentes sont centralisées dans `branding.fiscal`, sous forme de chaînes pour conserver les zéros initiaux. Elles sont imprimées sur la dernière page de chaque facture.

```text
IF : 73149010
ICE : 003999044000004
INP : 084209071
```

Aucun champ fiscal ne figure dans le formulaire, la validation ou les valeurs par défaut. Le label utilisé est INP. La configuration du cabinet est la seule source de ces valeurs ; d’anciennes données de formulaire contenant une propriété fiscale sont ignorées lors de la validation.
