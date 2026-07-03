import { describe, expect, it } from 'vitest';
import { buildAnalyticsSummary, type StoredRoom } from './analytics.ts';

const BOARD_SIZE = 25;
const FREE_SPACE_INDEX = 12;

function createClicked(indices: number[]): boolean[] {
  const clicked = new Array(BOARD_SIZE).fill(false);
  clicked[FREE_SPACE_INDEX] = true;
  for (const index of indices) clicked[index] = true;
  return clicked;
}

function createRoom(overrides: Partial<StoredRoom> = {}): StoredRoom {
  const card = new Array(BOARD_SIZE).fill('Prompt');
  card[FREE_SPACE_INDEX] = 'FREE';
  const names = new Array(BOARD_SIZE).fill('');
  return {
    code: 'A',
    card,
    names,
    clicked_cells: createClicked([]),
    bingo_count: 0,
    created_at: '2026-07-01T12:00:00.000Z',
    ...overrides,
  };
}

describe('buildAnalyticsSummary', () => {
  it('returns an empty summary for no rooms', () => {
    const summary = buildAnalyticsSummary([]);
    expect(summary.roomCount).toBe(0);
    expect(summary.totalEntries).toBe(0);
    expect(summary.participants).toEqual([]);
    expect(summary.prompts).toEqual([]);
  });

  it('ignores names on unclicked cells', () => {
    const room = createRoom({
      names: (() => {
        const names = new Array(BOARD_SIZE).fill('');
        names[0] = 'Alex';
        return names;
      })(),
      clicked_cells: createClicked([]),
    });

    const summary = buildAnalyticsSummary([room]);
    expect(summary.totalEntries).toBe(0);
    expect(summary.participants).toEqual([]);
  });

  it('counts clicked cells with valid names', () => {
    const room = createRoom({
      names: (() => {
        const names = new Array(BOARD_SIZE).fill('');
        names[0] = 'Alex';
        names[1] = 'Blake';
        return names;
      })(),
      clicked_cells: createClicked([0, 1]),
    });

    const summary = buildAnalyticsSummary([room]);
    expect(summary.totalEntries).toBe(2);
    expect(summary.uniqueParticipants).toBe(2);
    expect(summary.participants.map((participant) => participant.name)).toEqual(['Alex', 'Blake']);
  });

  it('merges names case-insensitively', () => {
    const room = createRoom({
      names: (() => {
        const names = new Array(BOARD_SIZE).fill('');
        names[0] = 'Kate';
        names[1] = 'kate';
        return names;
      })(),
      clicked_cells: createClicked([0, 1]),
    });

    const summary = buildAnalyticsSummary([room]);
    expect(summary.uniqueParticipants).toBe(1);
    expect(summary.participants[0]).toMatchObject({ name: 'Kate', count: 2 });
  });

  it('ignores placeholder and free-space names', () => {
    const room = createRoom({
      names: (() => {
        const names = new Array(BOARD_SIZE).fill('');
        names[0] = 'NAME';
        names[FREE_SPACE_INDEX] = 'Should Not Count';
        return names;
      })(),
      clicked_cells: createClicked([0, FREE_SPACE_INDEX]),
    });

    const summary = buildAnalyticsSummary([room]);
    expect(summary.totalEntries).toBe(0);
  });

  it('ignores names when clicked_cells is missing', () => {
    const room = createRoom({
      names: (() => {
        const names = new Array(BOARD_SIZE).fill('');
        names[0] = 'Alex';
        return names;
      })(),
      clicked_cells: undefined,
    });

    const summary = buildAnalyticsSummary([room]);
    expect(summary.totalEntries).toBe(0);
  });

  it('stores publishedAt when provided', () => {
    const summary = buildAnalyticsSummary([createRoom()], '2026-07-03T22:00:00.000Z');
    expect(summary.publishedAt).toBe('2026-07-03T22:00:00.000Z');
  });
});
