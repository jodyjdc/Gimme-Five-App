import { beforeEach, describe, expect, it } from 'vitest';
import { archiveLabel, readArchive, removeFromArchive, saveToArchive } from './archive';
import type { Episode } from './episodeFile';

const episode = (guestName: string, completed = 0): Episode => ({
  guestName,
  guestNameSize: 100,
  rankings: Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    fullTitle: `Titolo ${index + 1}`,
    keyword: `Parola ${index + 1}`,
    entries: ['a', 'b', 'c', 'd', 'e'],
    completed: index < completed,
  })),
  boxAssignments: completed ? { 2: 1 } : {},
});

describe('archivio ospiti', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    Object.assign(globalThis, { window: { localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) } } });
  });

  it('salva, mette in cima e aggiorna lo stesso ospite invece di duplicarlo', () => {
    saveToArchive(episode('Mario Rossi'));
    saveToArchive(episode('Valerio Mazzei'));
    const list = saveToArchive(episode('  mario rossi ', 2));
    expect(list.map(entry => entry.episode.guestName)).toEqual(['  mario rossi ', 'Valerio Mazzei']);
    expect(readArchive()).toEqual(list);
    expect(archiveLabel(list[0])).toMatch(/^mario rossi · 2\/5 · \d\d\/\d\d$/);
    expect(list[0].episode.boxAssignments).toEqual({ 2: 1 });
  });

  it('elimina e salta le voci rovinate', () => {
    const [entry] = saveToArchive(episode('Mario Rossi'));
    expect(removeFromArchive(entry.id)).toEqual([]);
    window.localStorage.setItem('gimme-five:archivio', JSON.stringify([{ id: 'x', savedAt: 'ieri', episode: { guestName: 1 } }]));
    expect(readArchive()).toEqual([]);
  });
});
