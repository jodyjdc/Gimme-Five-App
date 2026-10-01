import { describe, expect, it } from 'vitest';
import { parseEpisode } from './episodeFile';

const ranking = (id: number, completed = false) => ({
  id,
  fullTitle: `Titolo ${id}`,
  keyword: `Parola ${id}`,
  entries: completed ? ['a', 'b', 'c', 'd', 'e'] : ['', '', '', '', ''],
  completed,
});

const file = (extra: Record<string, unknown> = {}) => JSON.stringify({
  formato: 'gimme-five-ospite',
  versione: 1,
  guestName: 'Valerio Mazzei',
  guestNameSize: 110,
  rankings: [ranking(1, true), ranking(2), ranking(3), ranking(4), ranking(5)],
  boxAssignments: { 3: 1 },
  ...extra,
});

describe('parseEpisode', () => {
  it('rilegge ospite, classifiche e caselle', () => {
    const episode = parseEpisode(file());
    expect(episode.guestName).toBe('Valerio Mazzei');
    expect(episode.guestNameSize).toBe(110);
    expect(episode.rankings[0]).toEqual(ranking(1, true));
    expect(episode.boxAssignments).toEqual({ 3: 1 });
  });

  it('rifiuta file che non sono di Gimme Five', () => {
    expect(() => parseEpisode('non è json')).toThrow();
    expect(() => parseEpisode(JSON.stringify({ guestName: 'X', rankings: [] }))).toThrow();
  });

  it('ripulisce dati strani: voci mancanti, caselle impossibili, grandezza fuori scala', () => {
    const episode = parseEpisode(file({
      guestNameSize: 999,
      rankings: [{ ...ranking(1, true), entries: ['solo uno'] }, ranking(2), ranking(3), ranking(4), ranking(5)],
      // casella 9 non esiste, classifica 2 non è completata, classifica 1 non può stare in due caselle
      boxAssignments: { 1: 1, 2: 1, 9: 1, 4: 2 },
    }));
    expect(episode.guestNameSize).toBe(130);
    expect(episode.rankings[0].entries).toEqual(['solo uno', '', '', '', '']);
    expect(episode.boxAssignments).toEqual({ 1: 1 });
  });
});
