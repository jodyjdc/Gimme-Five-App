// Archivio ospiti: ospiti con le loro classifiche salvati nel browser, da richiamare dalla schermata iniziale
// o dalle impostazioni. È uno solo per tutte le versioni grafiche (stesso sito, stessa memoria del browser).
// Resta su questo computer e in questo browser: per spostarlo altrove c'è "Esporta ospite" (file).
import { useState } from 'react';
import { parseEpisode, type Episode } from './episodeFile';

const KEY = 'gimme-five:archivio';

export interface ArchiveEntry {
  id: string;
  savedAt: string;
  episode: Episode;
}

const sameGuest = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export const readArchive = (): ArchiveEntry[] => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? '[]') as unknown;
    if (!Array.isArray(raw)) return [];
    // Ogni voce è controllata come un file importato: quelle rovinate si saltano.
    return raw.flatMap(item => {
      try {
        const entry = item as Record<string, unknown>;
        return [{ id: String(entry.id), savedAt: String(entry.savedAt), episode: parseEpisode(JSON.stringify(entry.episode)) }];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
};

const writeArchive = (entries: ArchiveEntry[]) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.map(entry => ({
      ...entry,
      episode: { formato: 'gimme-five-ospite', versione: 1, ...entry.episode },
    }))));
  } catch {
    // Memoria del browser piena o bloccata: l'archivio resta com'era.
  }
  return entries;
};

/** Salva l'ospite in cima all'archivio; se c'è già un ospite con lo stesso nome lo aggiorna. */
export const saveToArchive = (episode: Episode): ArchiveEntry[] => {
  const others = readArchive().filter(entry => !sameGuest(entry.episode.guestName, episode.guestName));
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return writeArchive([{ id, savedAt: new Date().toISOString(), episode }, ...others]);
};

export const removeFromArchive = (id: string): ArchiveEntry[] => writeArchive(readArchive().filter(entry => entry.id !== id));

/** "Valerio Mazzei · 3/5 · 22/10": nome, classifiche completate, giorno del salvataggio. */
export const archiveLabel = ({ episode, savedAt }: ArchiveEntry) => {
  const done = episode.rankings.filter(ranking => ranking.completed).length;
  const day = new Date(savedAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
  return `${episode.guestName.trim() || 'Senza nome'} · ${done}/5 · ${day}`;
};

/** Stato dell'archivio per un componente (si aggiorna dopo ogni salvataggio o eliminazione). */
export const useArchive = () => {
  const [entries, setEntries] = useState<ArchiveEntry[]>(readArchive);
  return {
    entries,
    save: (episode: Episode) => setEntries(saveToArchive(episode)),
    remove: (id: string) => setEntries(removeFromArchive(id)),
  };
};
