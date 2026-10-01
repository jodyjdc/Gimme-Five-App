// Ospite su file: salva ospite e classifiche (anche quelle già compilate) in un file .json sul computer
// e lo ricarica quando serve. Il file è lo stesso per tutte le versioni grafiche: si può salvare in una
// e riaprire in un'altra.

export interface EpisodeRanking {
  id: number;
  fullTitle: string;
  keyword: string;
  entries: string[];
  completed: boolean;
}

export interface Episode {
  guestName: string;
  guestNameSize: number;
  rankings: EpisodeRanking[];
  /** Casella (1-5) → classifica che contiene. */
  boxAssignments: Partial<Record<number, number>>;
}

const FORMAT = 'gimme-five-ospite';

const fileName = (guestName: string) => {
  const slug = guestName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `gimme-five-${slug || 'ospite'}-${new Date().toISOString().slice(0, 10)}.json`;
};

/** Scarica la puntata come file (finisce nella cartella Download). */
export const saveEpisodeFile = (episode: Episode) => {
  const data = { formato: FORMAT, versione: 1, salvato: new Date().toISOString(), ...episode };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName(episode.guestName);
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const isString = (value: unknown): value is string => typeof value === 'string';

/** Legge e controlla il contenuto di un file. Se qualcosa non torna lancia un errore con un messaggio leggibile. */
export const parseEpisode = (text: string): Episode => {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('il file non è un salvataggio di Gimme Five.');
  }
  const source = data as Record<string, unknown> | null;
  if (!source || source.formato !== FORMAT || !isString(source.guestName) || !Array.isArray(source.rankings) || source.rankings.length !== 5) {
    throw new Error('il file non è un salvataggio di Gimme Five.');
  }

  // Gli id delle classifiche sono sempre 1-5 nell'ordine del file.
  const rankings: EpisodeRanking[] = source.rankings.map((raw, index) => {
    const ranking = (raw ?? {}) as Record<string, unknown>;
    const entries = Array.isArray(ranking.entries) ? ranking.entries : [];
    return {
      id: index + 1,
      fullTitle: isString(ranking.fullTitle) ? ranking.fullTitle : '',
      keyword: isString(ranking.keyword) ? ranking.keyword : '',
      entries: Array.from({ length: 5 }, (_, position) => (isString(entries[position]) ? entries[position] : '')),
      completed: ranking.completed === true,
    };
  });

  // Caselle: solo coppie valide, ogni classifica in una casella sola e solo se è completata.
  const boxAssignments: Partial<Record<number, number>> = {};
  const used = new Set<number>();
  for (const [box, rankingId] of Object.entries((source.boxAssignments ?? {}) as Record<string, unknown>)) {
    const boxId = Number(box);
    if (Number.isInteger(boxId) && boxId >= 1 && boxId <= 5 && typeof rankingId === 'number' && rankings[rankingId - 1]?.completed && !used.has(rankingId)) {
      boxAssignments[boxId] = rankingId;
      used.add(rankingId);
    }
  }

  const size = typeof source.guestNameSize === 'number' ? source.guestNameSize : 100;
  return { guestName: source.guestName, guestNameSize: Math.min(130, Math.max(70, size)), rankings, boxAssignments };
};

/** Apre la finestra per scegliere il file; se è valido passa la puntata a `onLoad`, altrimenti avvisa. */
export const openEpisodeFile = (onLoad: (episode: Episode) => void) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      onLoad(parseEpisode(await file.text()));
    } catch (error) {
      window.alert(`Impossibile importare: ${error instanceof Error ? error.message : 'file non leggibile.'}`);
    }
  };
  input.click();
};
