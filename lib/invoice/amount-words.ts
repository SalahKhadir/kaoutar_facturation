const small = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];

function underHundred(value: number, terminal = true): string {
    if (value < 17) return small[value];
    if (value < 20) return `dix-${small[value - 10]}`;
    if (value >= 80) return value === 80 ? `quatre-vingt${terminal ? 's' : ''}` : `quatre-vingt-${underHundred(value - 80)}`;
    if (value >= 70) return value === 71 ? 'soixante et onze' : `soixante-${underHundred(value - 60)}`;
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'][Math.floor(value / 10)];
    const units = value % 10;
    return tens + (units === 1 ? ' et un' : units ? `-${small[units]}` : '');
}
function underThousand(value: number, terminal = true): string {
    if (value < 100) return underHundred(value, terminal);
    const hundreds = Math.floor(value / 100);
    const rest = value % 100;
    const prefix = hundreds === 1 ? 'cent' : `${small[hundreds]} cent${!rest && terminal ? 's' : ''}`;
    return prefix + (rest ? ` ${underHundred(rest, terminal)}` : '');
}
export function integerInFrench(value: number): string {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error('Montant entier positif requis.');
    for (const [scale, label] of [[1e9, 'milliard'], [1e6, 'million']] as const) {
        if (value >= scale) {
            const count = Math.floor(value / scale), rest = value % scale;
            return `${integerInFrench(count)} ${label}${count > 1 ? 's' : ''}${rest ? ` ${integerInFrench(rest)}` : ''}`;
        }
    }
    if (value >= 1000) {
        const count = Math.floor(value / 1000), rest = value % 1000;
        return `${count === 1 ? '' : `${underThousand(count, false)} `}mille${rest ? ` ${underThousand(rest)}` : ''}`;
    }
    return underThousand(value);
}
/** Integer centimes only: no floating-point arithmetic or rounding. */
export function amountInFrench(minor: number): string {
    if (!Number.isSafeInteger(minor) || minor < 0) throw new Error('Montant en centimes invalide.');
    const dirhams = Math.floor(minor / 100), centimes = minor % 100;
    const noun = `${dirhams >= 1000000 && dirhams % 1000000 === 0 ? 'de ' : ''}dirham${dirhams <= 1 ? '' : 's'}`;
    return `${integerInFrench(dirhams)} ${noun}${centimes ? ` et ${integerInFrench(centimes)} centime${centimes === 1 ? '' : 's'}` : ''}`;
}
export const amountSentence = (minor: number) => `Arrêtée la présente facture à la somme de ${amountInFrench(minor)}.`;
