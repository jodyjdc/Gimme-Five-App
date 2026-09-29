
export interface Ranking {
  id: number;
  fullTitle: string;
  keyword: string;
  entries: string[];
  completed: boolean;
}

export type BoxAssignments = Partial<Record<number, number>>;

export interface RankingBox {
  boxId: number;
  ranking: Ranking | null;
}
