import { type EarnedBadge, BADGE_CATALOG, checkNewBadges } from './badges';

const STORAGE_KEY       = 'chandle-state';
const BONUS_KEY         = 'chandle-bonus';
const STATS_KEY         = 'chandle-stats';
const ARCHIVE_KEY       = 'chandle-archive';
const MOVIE_STATE_KEY   = 'chandle-movie-state';
const MOVIE_BONUS_KEY   = 'chandle-movie-bonus';
const HISTORY_KEY       = 'chandle-history';
const CHALLENGE_KEY     = 'chandle-challenges';

export interface GameState {
  guesses: string[];
  hintsUnlocked: number; // 0–4 hints revealed
  solved: boolean;
  revealed: boolean;     // player clicked "Give up"
  date: string;          // YYYY-MM-DD local date
}

export interface BonusState {
  week: string;          // e.g. "week-62" — resets each week
  shareCount: number;    // 0–3 shares completed
  unlocked: boolean;
  guesses: string[];
  solved: boolean;
  revealed: boolean;
}

export function freshState(date: string): GameState {
  return { guesses: [], hintsUnlocked: 0, solved: false, revealed: false, date };
}

export function freshBonusState(week: string): BonusState {
  return { week, shareCount: 0, unlocked: false, guesses: [], solved: false, revealed: false };
}

/** Load state from localStorage. Returns null if absent or from a different day. */
export function loadState(todayStr: string): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.date !== todayStr) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Load bonus state. Returns null if absent or from a different week. */
export function loadBonusState(weekStr: string): BonusState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BONUS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BonusState;
    if (parsed.week !== weekStr) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

export function saveBonusState(state: BonusState): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(BONUS_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

// ─── Movie mode state ────────────────────────────────────────────────────────

export function loadMovieState(todayStr: string): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(MOVIE_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.date !== todayStr) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveMovieState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(MOVIE_STATE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

export function loadMovieBonusState(weekStr: string): BonusState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(MOVIE_BONUS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BonusState;
    if (parsed.week !== weekStr) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveMovieBonusState(state: BonusState): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(MOVIE_BONUS_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

// ─── Player stats (persists across days) ──────────────────────────────────────

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[]; // index 0 = solved in 1 guess, ..., 5 = solved in 6
  lastPlayedDate: string;      // YYYY-MM-DD
  badges: EarnedBadge[];       // earned streak badges
}

export function freshStats(): PlayerStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0],
    lastPlayedDate: '',
    badges: [],
  };
}

export function loadStats(): PlayerStats {
  if (typeof window === 'undefined') return freshStats();
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) return freshStats();
    const parsed = JSON.parse(raw) as PlayerStats;
    // Migration guard for pre-v1.2 data
    if (!parsed.badges) parsed.badges = [];
    return parsed;
  } catch {
    return freshStats();
  }
}

export function saveStats(stats: PlayerStats): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch { /* quota */ }
}

/**
 * Record a completed game result.
 * Call this once per day when the game ends (win or lose).
 * Returns { stats, newBadges } so the caller can show a badge celebration.
 */
export function recordGameResult(
  todayStr: string,
  solved: boolean,
  guessCount: number,
  hintsUsed?: number,
  puzzleId?: number,
): { stats: PlayerStats; newBadges: EarnedBadge[] } {
  const stats = loadStats();

  // Prevent double-recording the same day
  if (stats.lastPlayedDate === todayStr) return { stats, newBadges: [] };

  stats.gamesPlayed += 1;

  if (solved) {
    stats.gamesWon += 1;
    stats.guessDistribution[guessCount - 1] = (stats.guessDistribution[guessCount - 1] || 0) + 1;
  }

  // Streak logic: consecutive days
  if (stats.lastPlayedDate) {
    const last = new Date(stats.lastPlayedDate + 'T00:00:00');
    const today = new Date(todayStr + 'T00:00:00');
    const diffDays = Math.round((today.getTime() - last.getTime()) / 86_400_000);

    if (diffDays === 1 && solved) {
      stats.currentStreak += 1;
    } else if (diffDays === 1 && !solved) {
      stats.currentStreak = 0;
    } else {
      // Skipped a day or more — streak resets
      stats.currentStreak = solved ? 1 : 0;
    }
  } else {
    // First ever game
    stats.currentStreak = solved ? 1 : 0;
  }

  stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);

  // Award new badges
  const newBadges = checkNewBadges(stats.currentStreak, stats.badges, todayStr);
  stats.badges = [...stats.badges, ...newBadges];

  stats.lastPlayedDate = todayStr;

  saveStats(stats);

  // Also record to day history
  if (puzzleId !== undefined) {
    saveDayResult({
      date: todayStr,
      puzzleId,
      solved,
      guessCount,
      hintsUsed: hintsUsed ?? 0,
    });
  }

  return { stats, newBadges };
}

// ─── Archive (practice mode) state ────────────────────────────────────────────

export interface ArchiveEntry {
  puzzleId: number;
  guesses: string[];
  hintsUnlocked: number;
  solved: boolean;
  revealed: boolean;
}

export function loadArchive(): Record<number, ArchiveEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(ARCHIVE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<number, ArchiveEntry>;
  } catch {
    return {};
  }
}

export function saveArchiveEntry(entry: ArchiveEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const archive = loadArchive();
    archive[entry.puzzleId] = entry;
    window.localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
  } catch { /* quota */ }
}

// ─── Challenge state ──────────────────────────────────────────────────────────

export interface ChallengeEntry {
  puzzleId: number;
  guesses: string[];
  hintsUnlocked: number;
  solved: boolean;
  revealed: boolean;
}

export function loadChallenges(): Record<number, ChallengeEntry> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CHALLENGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<number, ChallengeEntry>;
  } catch {
    return {};
  }
}

export function saveChallengeEntry(entry: ChallengeEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const challenges = loadChallenges();
    challenges[entry.puzzleId] = entry;
    window.localStorage.setItem(CHALLENGE_KEY, JSON.stringify(challenges));
  } catch { /* quota */ }
}

// ─── Day history (for weekly recap) ───────────────────────────────────────────

export interface DayResult {
  date: string;       // YYYY-MM-DD
  puzzleId: number;
  solved: boolean;
  guessCount: number;
  hintsUsed: number;
}

export function loadHistory(): Record<string, DayResult> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, DayResult>;
  } catch {
    return {};
  }
}

export function saveDayResult(result: DayResult): void {
  if (typeof window === 'undefined') return;
  try {
    const history = loadHistory();
    history[result.date] = result;
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch { /* quota */ }
}
