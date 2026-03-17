'use client';

import { type Puzzle } from '@/lib/puzzles';

interface HintSystemProps {
  puzzle: Puzzle;
  hintsUnlocked: number;    // 0–4
  guessCount: number;
  onUnlockHint: () => void;
  solved: boolean;
  revealed: boolean;
}

const MAX_HINTS = 4;
const NUDGE_THRESHOLD = 6; // Show nudge after this many wrong guesses

// Hints are revealed in this order
function getHints(puzzle: Puzzle): { label: string; value: string }[] {
  return [
    { label: 'Era',      value: puzzle.era },
    { label: 'Initials', value: puzzle.firstLetters },
    { label: 'Genre',    value: puzzle.genre },
    { label: 'Artist',   value: puzzle.artist },
  ];
}

export default function HintSystem({
  puzzle,
  hintsUnlocked,
  guessCount,
  onUnlockHint,
  solved,
  revealed,
}: HintSystemProps) {
  const hints = getHints(puzzle);
  const canUnlock = hintsUnlocked < MAX_HINTS && !solved && !revealed;
  const showNudge = guessCount >= NUDGE_THRESHOLD && hintsUnlocked === 0 && !solved;

  return (
    <div className="space-y-4">
      {/* Hints header row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
          Hints {hintsUnlocked > 0 ? `(${hintsUnlocked}/${MAX_HINTS} used)` : ''}
        </span>
        {canUnlock && (
          <button
            onClick={onUnlockHint}
            className="
              text-xs px-3 py-1.5
              border border-[var(--gold)] text-[var(--gold)]
              hover:bg-[var(--gold)] hover:text-[var(--bg)]
              transition-colors duration-150
              font-medium tracking-wide
              cursor-pointer
            "
          >
            + Unlock next hint
          </button>
        )}
      </div>

      {/* Nudge if player is stuck */}
      {showNudge && (
        <p className="text-xs text-[var(--muted)] animate-fade-in">
          Stuck? A hint might help.
        </p>
      )}

      {/* Hint list */}
      {hintsUnlocked > 0 && (
        <ul className="space-y-2">
          {hints.map((hint, i) => {
            const isUnlocked = i < hintsUnlocked;
            return (
              <li
                key={hint.label}
                className={`
                  flex items-start gap-3 text-sm
                  ${isUnlocked ? 'animate-fade-in' : 'opacity-40'}
                `}
                style={isUnlocked ? { animationDelay: `${i * 60}ms` } : {}}
              >
                <span className="text-[var(--gold)] mt-0.5 select-none">•</span>
                <span>
                  <span className="text-[var(--muted)] text-xs uppercase tracking-wider mr-2">
                    {hint.label}:
                  </span>
                  {isUnlocked ? (
                    <span className="font-medium text-[var(--ink)]">{hint.value}</span>
                  ) : (
                    <span className="text-[var(--muted)] italic text-xs">— locked —</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* All hints locked placeholder */}
      {hintsUnlocked === 0 && !showNudge && (
        <p className="text-xs text-[var(--muted)]">
          No hints used yet.
        </p>
      )}
    </div>
  );
}
