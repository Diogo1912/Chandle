import { type Puzzle } from './puzzles';

/**
 * Maps day-of-week to puzzle difficulty.
 * Mon/Tue = easy, Wed/Thu = medium, Fri/Sat/Sun = hard.
 * This creates a weekly escalation — easier to start the week, harder by Friday.
 */
export function getDayDifficulty(date: Date): 'easy' | 'medium' | 'hard' {
  const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  if (day === 1 || day === 2) return 'easy';
  if (day === 3 || day === 4) return 'medium';
  return 'hard'; // Fri, Sat, Sun
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Returns today's puzzle. Filters by day-of-week difficulty so difficulty
 * escalates across the week. Falls back to full pool if a tier is empty.
 */
export function getDailyPuzzle(puzzles: Puzzle[]): {
  puzzle: Puzzle;
  dayIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
  dayName: string;
} {
  const epoch = new Date(2026, 2, 17).getTime(); // local midnight Mar 17
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayIndex = Math.floor((today - epoch) / 86_400_000);

  const difficulty = getDayDifficulty(now);
  const dayName = DAY_NAMES[now.getDay()];

  // Filter pool by today's difficulty, fall back to full pool if somehow empty
  const pool = puzzles.filter(p => p.difficulty === difficulty);
  const effectivePool = pool.length > 0 ? pool : puzzles;
  const puzzle = effectivePool[((dayIndex % effectivePool.length) + effectivePool.length) % effectivePool.length];

  return { puzzle, dayIndex, difficulty, dayName };
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
 * Returns a week key like "week-62" — number of weeks since epoch.
 * Changes every Monday, so the bonus puzzle resets weekly.
 */
export function getWeekString(): string {
  const epoch = new Date(2026, 2, 17).getTime();
  const now = new Date();
  const weekIndex = Math.floor((now.getTime() - epoch) / (7 * 86_400_000));
  return `week-${weekIndex}`;
}

/** Picks this week's bonus puzzle deterministically from the bonus pool. */
export function getWeekBonusPuzzle(bonusPuzzles: Puzzle[]): Puzzle {
  const epoch = new Date(2026, 2, 17).getTime();
  const now = new Date();
  const weekIndex = Math.floor((now.getTime() - epoch) / (7 * 86_400_000));
  return bonusPuzzles[weekIndex % bonusPuzzles.length];
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
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],
          dp[i][j - 1],
          dp[i - 1][j - 1],
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
    const maxDist = normA.length > 10 ? 3 : 2;
    return levenshtein(normGuess, normA) <= maxDist;
  });
}

/**
 * Build the share card text for clipboard.
 *   🟩 = correct  🟥 = wrong  💡 = hint used  ⬜ = unused slot
 */
export function buildShareText(params: {
  guesses: string[];
  hintsUnlocked: number;
  solved: boolean;
  dayIndex: number;
  formalTitle: string;
  streak?: number;
  mode?: 'song' | 'movie';
  badgeEmoji?: string;
  badgeName?: string;
}): string {
  const { guesses, hintsUnlocked, solved, dayIndex, formalTitle, streak, mode, badgeEmoji, badgeName } = params;
  const MAX_GUESSES = 6;

  const modeLabel = mode === 'movie' ? ' (Movie)' : '';

  const rows: string[] = [];
  for (let i = 0; i < MAX_GUESSES; i++) {
    if (i < guesses.length) {
      rows.push(i === guesses.length - 1 && solved ? '🟩' : '🟥');
    } else {
      rows.push('⬜');
    }
  }

  const hintRow = hintsUnlocked > 0
    ? `💡 ${hintsUnlocked} hint${hintsUnlocked > 1 ? 's' : ''} used`
    : 'No hints used';

  const truncated = formalTitle.length > 60
    ? `"${formalTitle.slice(0, 57)}..."`
    : `"${formalTitle}"`;

  const streakRow = streak && streak > 1 ? `🔥 ${streak} day streak` : '';
  const badgeRow = badgeEmoji && badgeName ? `${badgeEmoji} ${badgeName}` : '';

  const lines = [
    `Chandle #${dayIndex + 1}${modeLabel}`,
    truncated,
    '',
    rows.join(''),
    hintRow,
  ];

  if (streakRow) lines.push(streakRow);
  if (badgeRow) lines.push(badgeRow);

  lines.push('', 'https://chandle.vercel.app');

  return lines.join('\n');
}

/** Build a challenge URL for a specific puzzle. */
export function buildChallengeUrl(puzzleId: number): string {
  return `https://chandle.vercel.app/challenge/${puzzleId}`;
}

/**
 * Returns today's movie puzzle. Same logic as getDailyPuzzle but for movie pool.
 */
export function getDailyMoviePuzzle(moviePuzzles: Puzzle[]): {
  puzzle: Puzzle;
  dayIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
  dayName: string;
} {
  const epoch = new Date(2026, 2, 17).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayIndex = Math.floor((today - epoch) / 86_400_000);

  const difficulty = getDayDifficulty(now);
  const dayName = DAY_NAMES[now.getDay()];

  const pool = moviePuzzles.filter(p => p.difficulty === difficulty);
  const effectivePool = pool.length > 0 ? pool : moviePuzzles;
  const puzzle = effectivePool[((dayIndex % effectivePool.length) + effectivePool.length) % effectivePool.length];

  return { puzzle, dayIndex, difficulty, dayName };
}

/** Picks this week's bonus movie puzzle deterministically. */
export function getWeekBonusMoviePuzzle(bonusMoviePuzzles: Puzzle[]): Puzzle {
  const epoch = new Date(2026, 2, 17).getTime();
  const now = new Date();
  const weekIndex = Math.floor((now.getTime() - epoch) / (7 * 86_400_000));
  return bonusMoviePuzzles[weekIndex % bonusMoviePuzzles.length];
}

// ─── Weekly recap ─────────────────────────────────────────────────────────────

export interface WeeklyRecap {
  weekLabel: string;          // e.g. "Mar 24 – Mar 30"
  daysPlayed: number;
  daysWon: number;
  bestSolveGuesses: number | null;
  streakAtEnd: number;
  results: (import('./storage').DayResult | null)[]; // 7 entries, Mon–Sun
}

export function buildWeeklyRecap(
  history: Record<string, import('./storage').DayResult>,
  currentStreak: number,
): WeeklyRecap | null {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun

  // Only generate recap on Sunday (day 0) or when previous week data exists
  // Find the Monday of the most recently completed week
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Calculate last Sunday (end of previous week)
  const daysToLastSunday = dayOfWeek === 0 ? 0 : dayOfWeek;
  const lastSunday = new Date(today.getTime() - daysToLastSunday * 86_400_000);
  const lastMonday = new Date(lastSunday.getTime() - 6 * 86_400_000);

  const fmt = (d: Date) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  const results: (import('./storage').DayResult | null)[] = [];
  let daysPlayed = 0;
  let daysWon = 0;
  let bestSolve: number | null = null;

  for (let i = 0; i < 7; i++) {
    const d = new Date(lastMonday.getTime() + i * 86_400_000);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    const result = history[dateStr] ?? null;
    results.push(result);

    if (result) {
      daysPlayed++;
      if (result.solved) {
        daysWon++;
        if (bestSolve === null || result.guessCount < bestSolve) {
          bestSolve = result.guessCount;
        }
      }
    }
  }

  if (daysPlayed === 0) return null;

  return {
    weekLabel: `${fmt(lastMonday)} – ${fmt(lastSunday)}`,
    daysPlayed,
    daysWon,
    bestSolveGuesses: bestSolve,
    streakAtEnd: currentStreak,
    results,
  };
}

export function buildWeeklyShareText(recap: WeeklyRecap): string {
  const dayEmojis = recap.results.map(r => {
    if (!r) return '⬜';
    return r.solved ? '🟩' : '🟥';
  }).join('');

  const lines = [
    `Chandle Weekly Recap`,
    recap.weekLabel,
    '',
    dayEmojis,
    `${recap.daysPlayed}/7 played | ${recap.daysWon} won`,
  ];

  if (recap.bestSolveGuesses !== null) {
    lines.push(`Best: ${recap.bestSolveGuesses} guess${recap.bestSolveGuesses !== 1 ? 'es' : ''}`);
  }
  if (recap.streakAtEnd > 1) {
    lines.push(`🔥 ${recap.streakAtEnd} day streak`);
  }

  lines.push('', 'https://chandle.vercel.app');
  return lines.join('\n');
}

/**
 * Get past puzzles that were available between epoch and yesterday.
 * Returns them in reverse chronological order (most recent first).
 */
export function getPastPuzzles(allPuzzles: Puzzle[]): {
  puzzle: Puzzle;
  dayIndex: number;
  date: string;
  difficulty: 'easy' | 'medium' | 'hard';
}[] {
  const epoch = new Date(2026, 2, 17).getTime(); // local midnight Mar 17
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const totalDays = Math.floor((today - epoch) / 86_400_000);

  const results: { puzzle: Puzzle; dayIndex: number; date: string; difficulty: 'easy' | 'medium' | 'hard' }[] = [];

  // Go from yesterday back to day 0
  for (let i = totalDays - 1; i >= 0; i--) {
    const dayMs = epoch + i * 86_400_000;
    const d = new Date(dayMs);
    const difficulty = getDayDifficulty(d);
    const pool = allPuzzles.filter(p => p.difficulty === difficulty);
    const effectivePool = pool.length > 0 ? pool : allPuzzles;
    const puzzle = effectivePool[((i % effectivePool.length) + effectivePool.length) % effectivePool.length];

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    results.push({ puzzle, dayIndex: i, date: `${y}-${m}-${day}`, difficulty });
  }

  return results;
}
