import { describe, expect, it } from 'vitest';
import { GLYPH_H, GLYPH_W, blankColumns, glyphPath, glyphRows } from './pixelFont';

describe('pixelFont', () => {
  it('ogni carattere supportato ha 9 righe da 5 colonne', () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?'\"-_+=:;#°/()&%*✓►◄★✦ ÀÈÉÌÒÙÑÄÖÜ";
    for (const char of chars) {
      const rows = glyphRows(char);
      expect(rows, char).toHaveLength(GLYPH_H);
      rows.forEach(row => expect(row, char).toMatch(new RegExp(`^[.#]{${GLYPH_W}}$`)));
    }
  });

  it('minuscole e accenti diventano maiuscole accentate', () => {
    expect(glyphRows('a')).toEqual(glyphRows('A'));
    expect(glyphRows('è').slice(2)).toEqual(glyphRows('E').slice(2));
    expect(glyphRows('è').slice(0, 2)).not.toEqual(glyphRows('E').slice(0, 2));
  });

  it('caratteri sconosciuti diventano un riquadro, non spariscono', () => {
    expect(glyphRows('@')).toEqual(glyphRows('□'));
    expect(glyphPath('@', 0)).not.toBe('');
    expect(glyphPath(' ', 0)).toBe('');
  });

  it('apostrofo curvo = apostrofo dritto', () => {
    expect(glyphRows('’')).toEqual(glyphRows("'"));
  });

  it('colonne vuote ai lati per il centraggio ottico', () => {
    expect(blankColumns('I')).toEqual([1, 1]);
    expect(blankColumns('►')).toEqual([0, 1]);
    expect(blankColumns('M')).toEqual([0, 0]);
    expect(blankColumns(' ')).toEqual([0, 0]);
  });
});
