'use client';

import { useState } from 'react';
import { type Puzzle } from '@/lib/puzzles';
import { type BonusState } from '@/lib/storage';
import { isCorrect } from '@/lib/gameLogic';
import { StarIcon, CameraIcon } from './Icons';

interface BonusSectionProps {
  puzzle: Puzzle;
  state: BonusState;
  onStateChange: (next: BonusState) => void;
}

const MAX_BONUS_GUESSES = 6;

export default function BonusSection({ puzzle, state, onStateChange }: BonusSectionProps) {
  const [guess, setGuess] = useState('');
  const [flash, setFlash] = useState(false);
  const [sharing, setSharing] = useState(false);

  // ── Share to unlock ───────────────────────────────────────────────
  async function handleShare() {
    setSharing(true);
    const shareMsg = 'Can you guess the song from its bureaucratic description? Play Chandle!';
    const shareUrl = 'https://chandle.vercel.app';

    let done = false;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Chandle — Guess the Song', text: shareMsg, url: shareUrl });
        done = true;
      } catch {
        // user cancelled — fall back to clipboard
      }
    }

    if (!done) {
      try {
        await navigator.clipboard.writeText(`${shareMsg} ${shareUrl}`);
        done = true;
      } catch {
        done = true; // blocked on some browsers — count it anyway
      }
    }

    setSharing(false);
    if (done) {
      onStateChange({ ...state, shareCount: 1, unlocked: true });
    }
  }

  // ── Bonus guess ───────────────────────────────────────────────────
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
    <section className="border-t-2 border-[var(--ink)] pt-10 mt-4 space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[var(--red)] leading-none"><StarIcon size={16} /></span>
        <span className="text-xs font-medium uppercase tracking-widest">Bonus Puzzle</span>
        <span className="text-xs px-2 py-0.5 border border-[var(--red)] text-[var(--red)] uppercase tracking-wider font-medium">
          Extra Hard
        </span>
        {state.unlocked && (
          <span className="text-xs text-[var(--muted)]">— no hints</span>
        )}
      </div>

      {/* ── Locked: share to unlock ── */}
      {!state.unlocked && (
        <div className="space-y-5">
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Share today&apos;s Chandle to your Instagram Story to unlock this week&apos;s bonus puzzle.
            <br />
            <span className="text-xs">No hints. No mercy.</span>
          </p>

          <button
            onClick={handleShare}
            disabled={sharing}
            className="
              w-full py-4 text-sm font-medium uppercase tracking-widest
              border-2 border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]
              hover:bg-transparent hover:text-[var(--ink)]
              disabled:opacity-50
              transition-colors duration-150 cursor-pointer
            "
          >
            {sharing ? 'Opening share\u2026' : <><CameraIcon size={16} className="inline -mt-0.5 mr-1.5" />Share to Instagram Story</>}
          </button>
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
