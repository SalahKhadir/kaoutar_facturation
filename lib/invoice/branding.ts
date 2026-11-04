export const INVOICE_TEXT_COLOR = '#000000';
export const INVOICE_HEADING_COLOR = '#5e0b1b';
export const INVOICE_TABLE_HEADER_BG = '#f0f0f0';

export const branding = {
    primary: '#600c20', // sampled from the original blank invoice PNG
    logo: '/branding/logo.png',
    doctor: 'Dr Kaoutar Samghouli',
    invoiceDoctor: 'SAMGHOULI Kaoutar',
    address: 'Lotissement Bourass N°22, 1er étage, App 04, Témara',
    fiscal: { inp: '084209071', ice: '003999044000004', if: '73149010' },
    background: '/branding/facture_background.png',
};

// A5 portrait, in points. The original PNG header ends near 124 pt and
// its footer starts near 529 pt. Coordinates use a top-left origin.
export const invoiceLayout = {
    width: 419.53,
    height: 595.28,
    contentTop: 145,
    left: 24,
    right: 395.53,
    titleTop: 164,
    informationTop: 199,
    tableTop: 245,
    dateTop: 145,
    continuationTableTop: 170,
    columnGap: 18,
    fiscalTop: 486,
    fiscalWidth: 200,
    bottom: 518,
    bottomSafetyMargin: 11,
    maximumContentHeight: 373,
    columns: [56, 40, 205.53, 70],
    fontSize: 8.5,
    lineHeight: 10.5,
    cellPadding: 5,
    headingHeight: 22,
    signatureSpace: 20,
} as const;
