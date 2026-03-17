'use client';

import { type Puzzle } from '@/lib/puzzles';

interface HintSystemProps {
  puzzle: Puzzle;
  hintsUnlocked: number;    // 0–4
  guessCount: number;
  solved: boolean;
  revealed: boolean;
}

const MAX_HINTS = 4;

// Derive initials from the answer: first letter of EVERY word, uppercased
function getInitials(answer: string): string {
  return answer
    .split(/\s+/)
    .filter(w => w.length > 0)
    .map(w => w[0].toUpperCase())
    .join(' ');
}

// Hints revealed in this order: era → genre → initials → artist
function getHints(puzzle: Puzzle): { label: string; value: string }[] {
  return [
    { label: 'Era',      value: puzzle.era },
    { label: 'Genre',    value: puzzle.genre },
    { label: 'Initials', value: getInitials(puzzle.answer) },
    { label: 'Artist',   value: puzzle.artist },
  ];
}

export default function HintSystem({
  puzzle,
  hintsUnlocked,
  guessCount,
  solved,
  revealed,
}: HintSystemProps) {
  const hints = getHints(puzzle);

  return (
    <div className="space-y-4">
      {/* Hints header */}
      <span className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
        Hints {hintsUnlocked > 0 ? `(${hintsUnlocked}/${MAX_HINTS} revealed)` : ''}
      </span>

      {/* Hint list — always show all 4 slots so locked ones are visible */}
      <ul className="space-y-2">
        {hints.map((hint, i) => {
          const isUnlocked = i < hintsUnlocked;
          return (
            <li
              key={hint.label}
              className="flex items-start gap-3 text-sm"
            >
              <span className={`mt-0.5 select-none ${isUnlocked ? 'text-[var(--gold)]' : 'text-[var(--border)]'}`}>•</span>
              <span>
                <span className="text-[var(--muted)] text-xs uppercase tracking-wider mr-2">
                  {hint.label}:
                </span>
                {isUnlocked ? (
                  <span className="font-medium text-[var(--ink)] animate-fade-in">{hint.value}</span>
                ) : (
                  <span className="text-[var(--muted)] italic text-xs">— locked —</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Contextual note */}
      {hintsUnlocked === 0 && !solved && !revealed && (
        <p className="text-xs text-[var(--muted)]">
          {guessCount === 0
            ? 'Hints unlock as you guess.'
            : 'Keep guessing — hints are on the way.'}
        </p>
      )}
    </div>
  );
}
