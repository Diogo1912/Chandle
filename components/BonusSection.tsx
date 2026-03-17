'use client';

import { useState } from 'react';
import { type Puzzle } from '@/lib/puzzles';
import { type BonusState } from '@/lib/storage';
import { isCorrect } from '@/lib/gameLogic';

interface BonusSectionProps {
  puzzle: Puzzle;
  state: BonusState;
  onStateChange: (next: BonusState) => void;
}

const MAX_BONUS_GUESSES = 6;

export default function BonusSection({ puzzle, state, onStateChange }: BonusSectionProps) {
  const [guess, setGuess] = useState('');
  const [flash, setFlash] = useState(false);
  const [shareFlash, setShareFlash] = useState<number | null>(null);

  // ── Share mechanic ──────────────────────────────────────────────
  async function handleShare(slot: number) {
    if (slot !== state.shareCount) return; // must share in order

    const shareMsg = 'Can you identify this song from its bureaucratic description? Play today\'s Chandle!';
    const shareUrl = 'https://chandle.app';
    let done = false;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Chandle — Guess the Song', text: shareMsg, url: shareUrl });
        done = true;
      } catch {
        // user cancelled — fall through to clipboard
      }
    }

    if (!done) {
      try {
        await navigator.clipboard.writeText(`${shareMsg} ${shareUrl}`);
        done = true;
      } catch {
        done = true; // count it anyway — clipboard blocked on some browsers
      }
    }

    if (done) {
      setShareFlash(slot);
      setTimeout(() => setShareFlash(null), 800);
      const newCount = state.shareCount + 1;
      onStateChange({ ...state, shareCount: newCount, unlocked: newCount >= 3 });
    }
  }

  // ── Bonus guess mechanic ────────────────────────────────────────
  function handleGuess() {
    const trimmed = guess.trim();
    if (!trimmed || state.solved || state.revealed || state.guesses.length >= MAX_BONUS_GUESSES) return;

    const correct = isCorrect(trimmed, puzzle);
    const newGuesses = [...state.guesses, trimmed];
    onStateChange({ ...state, guesses: newGuesses, solved: correct });
    setGuess('');

    if (!correct) {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
    }
  }

  const isFinished = state.solved || state.revealed || state.guesses.length >= MAX_BONUS_GUESSES;
  const wrongGuesses = state.guesses.filter((_, i) =>
    !(i === state.guesses.length - 1 && state.solved)
  );

  return (
    <section className="border-t-2 border-[var(--ink)] pt-10 mt-4 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[var(--red)] text-base leading-none">★</span>
        <span className="text-xs font-medium uppercase tracking-widest">
          Bonus Puzzle
        </span>
        <span className="text-xs px-2 py-0.5 border border-[var(--red)] text-[var(--red)] uppercase tracking-wider font-medium">
          Extra Hard
        </span>
        {state.unlocked && (
          <span className="text-xs text-[var(--muted)]">— no hints</span>
        )}
      </div>

      {/* ── Locked state ── */}
      {!state.unlocked && (
        <div className="space-y-5">
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Share Chandle with three people to unlock this week&apos;s bonus puzzle.
            <br />
            <span className="text-xs">No hints. No mercy.</span>
          </p>

          {/* Three share slots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((slot) => {
              const done = slot < state.shareCount;
              const isNext = slot === state.shareCount;
              const isFlashing = shareFlash === slot;
              return (
                <button
                  key={slot}
                  onClick={() => handleShare(slot)}
                  disabled={done || !isNext}
                  className={`
                    flex-1 py-3 text-xs font-medium uppercase tracking-wide border-2
                    transition-all duration-150
                    ${isFlashing ? 'scale-95' : ''}
                    ${done
                      ? 'border-[var(--green)] text-[var(--green)] cursor-default'
                      : isNext
                        ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] hover:bg-transparent hover:text-[var(--ink)] cursor-pointer'
                        : 'border-[var(--border)] text-[var(--border)] cursor-not-allowed'
                    }
                  `}
                >
                  {done ? '✓' : `Share ${slot + 1}`}
                </button>
              );
            })}
          </div>

          {/* Progress label */}
          <p className="text-xs text-[var(--muted)]">
            {state.shareCount === 0
              ? 'Share with 3 friends to unlock'
              : `${state.shareCount}/3 shared — ${3 - state.shareCount} more to go`}
          </p>
        </div>
      )}

      {/* ── Unlocked: bonus gameplay ── */}
      {state.unlocked && (
        <div className="space-y-6 animate-fade-in">

          {/* Bonus formal title */}
          <blockquote
            className="text-xl sm:text-2xl leading-snug font-medium italic text-center text-[var(--ink)] px-2"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            &ldquo;{puzzle.formal}&rdquo;
          </blockquote>

          {/* Wrong guesses */}
          {wrongGuesses.length > 0 && (
            <ul className="space-y-1.5">
              {wrongGuesses.map((g, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-[var(--muted)] line-through animate-slide-down">
                  <span className="text-[var(--red)] text-xs select-none">✗</span>
                  {g}
                </li>
              ))}
            </ul>
          )}

          {/* Input */}
          {!isFinished && (
            <div className={`transition-opacity duration-150 ${flash ? 'opacity-40' : 'opacity-100'}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <input
                  type="text"
                  className="guess-input flex-1"
                  placeholder="Type the song title…"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
                <button
                  onClick={handleGuess}
                  disabled={!guess.trim()}
                  className="
                    w-full sm:w-auto px-6 py-2.5
                    bg-[var(--ink)] text-[var(--bg)]
                    text-sm font-medium tracking-wide uppercase
                    border-2 border-[var(--ink)]
                    disabled:opacity-40
                    hover:bg-transparent hover:text-[var(--ink)]
                    transition-colors cursor-pointer
                  "
                >
                  Guess
                </button>
              </div>
              <p className="text-xs text-[var(--muted)] mt-3">
                {MAX_BONUS_GUESSES - state.guesses.length} attempt{MAX_BONUS_GUESSES - state.guesses.length !== 1 ? 's' : ''} remaining
              </p>
            </div>
          )}

          {/* Result */}
          {isFinished && (
            <div className="border-2 border-[var(--ink)] px-5 py-4 space-y-1 animate-scale-in">
              <p className={`text-xs uppercase tracking-widest ${state.solved ? 'text-[var(--green)]' : 'text-[var(--muted)]'}`}>
                {state.solved ? 'Bonus solved!' : 'Answer'}
              </p>
              <p className="text-xl font-semibold" style={{ fontFamily: 'var(--font-playfair)' }}>
                {puzzle.answer}
              </p>
              <p className="text-sm text-[var(--muted)]">{puzzle.artist} · {puzzle.era}</p>
            </div>
          )}

          {/* Give up */}
          {!isFinished && (
            <div className="text-center">
              <button
                onClick={() => onStateChange({ ...state, revealed: true })}
                className="text-xs text-[var(--muted)] underline hover:text-[var(--red)] transition-colors cursor-pointer"
              >
                Give up — show the answer
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
