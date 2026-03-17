import { type Puzzle } from './puzzles';

/**
 * Returns today's puzzle using a deterministic day-index from a fixed epoch.
 * Everyone on the same calendar date (local) gets the same puzzle.
 */
export function getDailyPuzzle(puzzles: Puzzle[]): { puzzle: Puzzle; dayIndex: number } {
  const epoch = new Date('2025-01-01').getTime();
  const now = new Date();
  // Strip to midnight local time so the index is stable all day
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayIndex = Math.floor((today - epoch) / 86_400_000);
  const puzzle = puzzles[((dayIndex % puzzles.length) + puzzles.length) % puzzles.length];
  return { puzzle, dayIndex };
}

/** Returns today's date as a YYYY-MM-DD string (local time). */
export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Normalise a string for comparison:
 * - lowercase
 * - strip punctuation
 * - remove common articles
 * - collapse whitespace
 */
export function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')       // strip punctuation
    .replace(/\b(the|a|an)\b/g, '')     // strip articles
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Levenshtein distance between two strings.
 * Classic dynamic programming — no external libraries.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  // dp[i][j] = edit distance between a[0..i-1] and b[0..j-1]
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1], // substitution
        );
      }
    }
  }
  return dp[m][n];
}

/**
 * Returns true if the player's guess matches any accepted answer.
 * Uses normalisation + Levenshtein for typo tolerance.
 */
export function isCorrect(guess: string, puzzle: Puzzle): boolean {
  const normGuess = normalise(guess);
  if (!normGuess) return false;

  return puzzle.accepted.some((accepted) => {
    const normA = normalise(accepted);
    if (normGuess === normA) return true;
    // Allow up to 2 edits for short strings, 3 for longer ones
    const maxDist = normA.length > 10 ? 3 : 2;
    return levenshtein(normGuess, normA) <= maxDist;
  });
}

/**
 * Build the share card text for clipboard.
 * Each row of emojis represents one guess attempt:
 *   🟩 = correct  🟥 = wrong  💡 = hint used  ⬜ = unused slot
 */
export function buildShareText(params: {
  guesses: string[];
  hintsUnlocked: number;
  solved: boolean;
  dayIndex: number;
  formalTitle: string;
}): string {
  const { guesses, hintsUnlocked, solved, dayIndex, formalTitle } = params;
  const MAX_GUESSES = 6;

  // Build emoji row — one slot per attempt
  const rows: string[] = [];
  for (let i = 0; i < MAX_GUESSES; i++) {
    if (i < guesses.length) {
      if (i === guesses.length - 1 && solved) {
        rows.push('🟩'); // correct guess
      } else {
        // Interleave hints: hint is "used" on the attempt after it was unlocked
        // Simplistic: mark 💡 for hint-adjacent guesses
        rows.push('🟥');
      }
    } else {
      rows.push('⬜');
    }
  }

  // Append hint indicators after the grid
  const hintRow = hintsUnlocked > 0 ? `💡 ${hintsUnlocked} hint${hintsUnlocked > 1 ? 's' : ''} used` : 'No hints used';

  const truncated = formalTitle.length > 60
    ? `"${formalTitle.slice(0, 57)}..."`
    : `"${formalTitle}"`;

  const lines = [
    `Chandle #${dayIndex + 1}`,
    truncated,
    '',
    rows.join(''),
    hintRow,
    '',
    'chandle.app',
  ];

  return lines.join('\n');
}
