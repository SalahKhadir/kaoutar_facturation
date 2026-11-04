export const INVOICE_TEXT_COLOR = '#000000';
export const INVOICE_HEADING_COLOR = '#5e0b1b';
export const INVOICE_TABLE_HEADER_BG = '#f0f0f0';
export const CONTENT_TOP_OFFSET = 24;

export const branding = {
    primary: '#600c20', // sampled from the original blank invoice PNG
    logo: '/branding/logo.png',
    doctor: 'Dr Kaoutar Samghouli',
    invoiceDoctor: 'SAMGHOULI Kaoutar',
    address: 'Lotissement Bourass N°22, 1er étage, App 04, Témara',
    background: '/branding/facture-background.png',
};

// Coordinates in points, measured on the original 1414 × 2000 blank artwork.
// Header ends at y=176; footer starts at y=737. All positions use a top-left origin.
export const invoiceLayout = {
    width: 595.28,
    height: 841.89,
    contentTop: 192 + CONTENT_TOP_OFFSET,
    left: 40,
    right: 555.28,
    titleTop: 214 + CONTENT_TOP_OFFSET,
    informationTop: 250 + CONTENT_TOP_OFFSET,
    tableTop: 304 + CONTENT_TOP_OFFSET,
    dateTop: 192 + CONTENT_TOP_OFFSET,
    continuationTableTop: 222 + CONTENT_TOP_OFFSET,
    columnGap: 25,
    fiscalTop: 660,
    fiscalWidth: 240,
    bottom: 716,
    bottomSafetyMargin: 21,
    maximumContentHeight: 524 - CONTENT_TOP_OFFSET,
    columns: [76, 55, 292.28, 92],
    fontSize: 9,
    lineHeight: 12,
    cellPadding: 6,
    headingHeight: 23,
    signatureSpace: 42,
} as const;
