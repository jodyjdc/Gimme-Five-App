
export interface Ranking {
  id: number;
  fullTitle: string;
  keyword: string;
  entries: string[];
  completed: boolean;
  /** "blind" = classifica alla cieca: le 5 cose le scrive l'host, si svelano una alla volta e l'ospite
   *  le colloca negli slot 1-5. Assente = classifica normale (l'ospite detta, l'host scrive). */
  mode?: 'blind';
  /** Le 5 cose da svelare, nell'ordine in cui escono. */
  blindItems?: string[];
}

export type BoxAssignments = Partial<Record<number, number>>;

export interface RankingBox {
  boxId: number;
  ranking: Ranking | null;
}
