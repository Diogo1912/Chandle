const STORAGE_KEY = 'chandle-state';
const BONUS_KEY   = 'chandle-bonus';

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
