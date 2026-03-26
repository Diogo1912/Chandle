const STORAGE_KEY = 'chandle-state';
const BONUS_KEY   = 'chandle-bonus';
const STATS_KEY   = 'chandle-stats';
const ARCHIVE_KEY = 'chandle-archive';

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

// ─── Player stats (persists across days) ──────────────────────────────────────

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[]; // index 0 = solved in 1 guess, ..., 5 = solved in 6
  lastPlayedDate: string;      // YYYY-MM-DD
}

export function freshStats(): PlayerStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0],
    lastPlayedDate: '',
  };
}

export function loadStats(): PlayerStats {
  if (typeof window === 'undefined') return freshStats();
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) return freshStats();
    return JSON.parse(raw) as PlayerStats;
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
 */
export function recordGameResult(todayStr: string, solved: boolean, guessCount: number): PlayerStats {
  const stats = loadStats();

  // Prevent double-recording the same day
  if (stats.lastPlayedDate === todayStr) return stats;

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
  stats.lastPlayedDate = todayStr;

  saveStats(stats);
  return stats;
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
