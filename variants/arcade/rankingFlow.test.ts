import { describe, expect, it } from 'vitest';
import { assignRankingToBox, buildRankingBoxes, selectRankingForBox } from './rankingFlow';
import { Ranking } from './types';

const makeRankings = (): Ranking[] => [
  {
    id: 1,
    fullTitle: 'Prima classifica',
    keyword: 'Prima',
    entries: ['', '', '', '', ''],
    completed: false,
  },
  {
    id: 2,
    fullTitle: 'Seconda classifica',
    keyword: 'Seconda',
    entries: ['', '', '', '', ''],
    completed: false,
  },
  {
    id: 3,
    fullTitle: 'Terza classifica',
    keyword: 'Terza',
    entries: ['', '', '', '', ''],
    completed: false,
  },
  {
    id: 4,
    fullTitle: 'Quarta classifica',
    keyword: 'Quarta',
    entries: ['', '', '', '', ''],
    completed: false,
  },
  {
    id: 5,
    fullTitle: 'Quinta classifica',
    keyword: 'Quinta',
    entries: ['', '', '', '', ''],
    completed: false,
  },
];

describe('ranking flow', () => {
  it('uses the selected box only as the visual position for the next ranking in setup order', () => {
    const rankings = makeRankings();

    const firstSelection = selectRankingForBox(rankings, {}, 4);
    expect(firstSelection?.id).toBe(1);

    const firstAssignments = assignRankingToBox({}, 4, firstSelection!.id);
    const boxesAfterFirstSelection = buildRankingBoxes(rankings, firstAssignments);

    expect(boxesAfterFirstSelection.find(box => box.boxId === 4)?.ranking?.keyword).toBe('Prima');
    expect(boxesAfterFirstSelection.find(box => box.boxId === 1)?.ranking).toBeNull();

    const secondSelection = selectRankingForBox(rankings, firstAssignments, 2);
    expect(secondSelection?.id).toBe(2);
  });

  it('opens the assigned ranking again when an already used box is selected', () => {
    const rankings = makeRankings();
    const assignments = assignRankingToBox({}, 5, 1);

    expect(selectRankingForBox(rankings, assignments, 5)?.fullTitle).toBe('Prima classifica');
  });

  it('creates new assignment objects without mutating previous state', () => {
    const assignments = { 4: 1 };
    const nextAssignments = assignRankingToBox(assignments, 2, 2);

    expect(assignments).toEqual({ 4: 1 });
    expect(nextAssignments).toEqual({ 2: 2, 4: 1 });
    expect(nextAssignments).not.toBe(assignments);
  });
});
