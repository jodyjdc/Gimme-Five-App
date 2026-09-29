import { BoxAssignments, Ranking, RankingBox } from './types';

const DEFAULT_BOX_IDS = [1, 2, 3, 4, 5];

const getAssignedRankingIds = (assignments: BoxAssignments): Set<number> =>
  new Set(
    Object.values(assignments).filter((rankingId): rankingId is number => typeof rankingId === 'number')
  );

export const getRankingAssignedToBox = (
  rankings: Ranking[],
  assignments: BoxAssignments,
  boxId: number
): Ranking | null => {
  const assignedRankingId = assignments[boxId];
  if (assignedRankingId === undefined) {
    return null;
  }

  return rankings.find(ranking => ranking.id === assignedRankingId) ?? null;
};

export const selectRankingForBox = (
  rankings: Ranking[],
  assignments: BoxAssignments,
  boxId: number
): Ranking | null => {
  const assignedRanking = getRankingAssignedToBox(rankings, assignments, boxId);
  if (assignedRanking) {
    return assignedRanking;
  }

  const assignedRankingIds = getAssignedRankingIds(assignments);
  return rankings.find(ranking => !assignedRankingIds.has(ranking.id)) ?? null;
};

export const assignRankingToBox = (
  assignments: BoxAssignments,
  boxId: number,
  rankingId: number
): BoxAssignments => ({
  ...assignments,
  [boxId]: rankingId,
});

export const buildRankingBoxes = (
  rankings: Ranking[],
  assignments: BoxAssignments,
  boxIds: number[] = DEFAULT_BOX_IDS
): RankingBox[] =>
  boxIds.map(boxId => ({
    boxId,
    ranking: getRankingAssignedToBox(rankings, assignments, boxId),
  }));
