import {it,expect} from 'vitest';
import {amountInFrench,amountSentence,integerInFrench} from '../lib/invoice/amount-words';
it.each([
    [0,'zéro dirham'], [1,'zéro dirham et un centime'], [100,'un dirham'], [101,'un dirham et un centime'],
    [10000,'cent dirhams'], [30000,'trois cents dirhams'], [30025,'trois cents dirhams et vingt-cinq centimes'],
    [7100,'soixante et onze dirhams'], [8000,'quatre-vingts dirhams'], [8100,'quatre-vingt-un dirhams'],
    [9100,'quatre-vingt-onze dirhams'], [20000000,'deux cent mille dirhams'], [8000000,'quatre-vingt mille dirhams'],
    [100000000,'un million de dirhams'], [20000000000,'deux cents millions de dirhams'],
    [8000000000,'quatre-vingts millions de dirhams'], [100000100,'un million un dirhams'],
    [100000000000,'un milliard de dirhams'],
] as const)('convertit %i centimes', (value,words)=>expect(amountInFrench(value)).toBe(words));
it('accorde les centaines uniquement à la fin',()=>{
    expect(integerInFrench(201)).toBe('deux cent un');
    expect(integerInFrench(280000)).toBe('deux cent quatre-vingt mille');
    expect(integerInFrench(999999999)).toBe('neuf cent quatre-vingt-dix-neuf millions neuf cent quatre-vingt-dix-neuf mille neuf cent quatre-vingt-dix-neuf');
    expect(amountSentence(30000)).toBe('Arrêtée la présente facture à la somme de trois cents dirhams.');
});
it.each([-1,0.5,NaN,Number.MAX_SAFE_INTEGER+1])('refuse un montant invalide %s',value=>expect(()=>amountInFrench(value)).toThrow());
