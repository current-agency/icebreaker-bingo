export const FREE_SPACE_INDEX = 12;
export const BOARD_SIZE = 25;

export const BINGO_SQUARES = [
  "Has more than 3 siblings",
  "Lives in a different state than they were born",
  "Has 3 or more pets",
  "Has a musical instrument in the room with them right now",
  "Has never seen Star Wars",
  "Speaks more than 2 languages",
  "Has been to more than 10 countries",
  "Worked a food service job",
  "Been to a concert in the last 3 months",
  "Has been on television",
  "Has lived in another country",
  "Has a twin",
  "Coached or refereed a youth sport",
  "Has a garden",
  "Has pulled an all-nighter in the last year",
  "Has eaten something bizarre on a dare",
  "Has a famous person follow them on social media",
  "Has cried at a commercial",
  "Has been on a blind date",
  "Owns a piece of furniture they built themselves",
  "Has changed a tire on the side of the road for someone they didn't know",
  "Has strong feelings about how a dishwasher should be loaded",
  "Has lied about having read a book",
  "Owns a gaming console from before 2000",
];

export const WINNING_PATTERNS = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

export function generateRandomCard(): string[] {
  const shuffled = [...BINGO_SQUARES].sort(() => Math.random() - 0.5);
  shuffled.splice(FREE_SPACE_INDEX, 0, "FREE");
  return shuffled;
}

export function createInitialClicked(cells?: boolean[]): boolean[] {
  if (cells) return cells;
  const clicked = new Array(BOARD_SIZE).fill(false);
  clicked[FREE_SPACE_INDEX] = true;
  return clicked;
}

export function createEmptyNames(): string[] {
  return new Array(BOARD_SIZE).fill('');
}

export function getWinningCells(clicked: boolean[]): boolean[] {
  return checkForWins(clicked).winning;
}

export function checkForWins(clicked: boolean[]): { winning: boolean[]; count: number } {
  const winning = new Array(BOARD_SIZE).fill(false);
  let count = 0;
  for (const pattern of WINNING_PATTERNS) {
    if (pattern.every((i) => clicked[i])) {
      count++;
      pattern.forEach((i) => { winning[i] = true; });
    }
  }
  return { winning, count };
}

export function applyCellToggle(
  prev: boolean[],
  index: number,
  bingoCount: number,
): { next: boolean[]; winning: boolean[]; bingoCount: number; gainedLines: number } {
  const next = [...prev];
  next[index] = !next[index];
  const prevWins = checkForWins(prev);
  const nextWins = checkForWins(next);
  const gainedLines = nextWins.count - prevWins.count;
  return {
    next,
    winning: nextWins.winning,
    bingoCount: gainedLines > 0 ? bingoCount + gainedLines : bingoCount,
    gainedLines,
  };
}

export function formatCount(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function createConfettiParticles(): { x: number; y: number; rotate: number }[] {
  return Array.from({ length: 24 }, () => ({
    x: (Math.random() - 0.5) * 700,
    y: (Math.random() - 0.5) * 600,
    rotate: Math.random() * 900,
  }));
}
