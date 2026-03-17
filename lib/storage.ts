const STORAGE_KEY = 'chandle-state';

export interface GameState {
  guesses: string[];
  hintsUnlocked: number; // 0–4 hints revealed
  solved: boolean;
  revealed: boolean;     // player clicked "Give up"
  date: string;          // YYYY-MM-DD local date
}

export function freshState(date: string): GameState {
  return {
    guesses: [],
    hintsUnlocked: 0,
    solved: false,
    revealed: false,
    date,
  };
}

/** Load state from localStorage. Returns null if absent or from a different day. */
export function loadState(todayStr: string): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    // Reset if it's a new day
    if (parsed.date !== todayStr) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Persist state to localStorage. */
export function saveState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently ignore quota errors
  }
}
