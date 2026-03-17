'use client';

import { useEffect } from 'react';
import { type Puzzle } from '@/lib/puzzles';
import { type GameState } from '@/lib/storage';
import ShareCard from './ShareCard';

interface ResultModalProps {
  puzzle: Puzzle;
  state: GameState;
  dayIndex: number;
  onClose: () => void;
}

export default function ResultModal({
  puzzle,
  state,
  dayIndex,
  onClose,
}: ResultModalProps) {
  const { solved, revealed, guesses, hintsUnlocked } = state;

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const isWin = solved;
  const isLoseOrGiveUp = !solved && (revealed || guesses.length >= 6);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(26,26,24,0.6)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Game result"
    >
      {/* Modal panel — stop click propagation */}
      <div
        className="
          relative w-full max-w-md
          bg-[var(--bg)]
          border-2 border-[var(--ink)]
          p-8 space-y-6
          animate-scale-in
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4
            text-[var(--muted)] hover:text-[var(--ink)]
            text-xl leading-none
            cursor-pointer transition-colors
          "
          aria-label="Close"
        >
          ×
        </button>

        {/* Win state */}
        {isWin && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--green)]">
              Correct!
            </p>
            <h2
              className="text-2xl font-bold leading-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {puzzle.answer}
            </h2>
            <div className="flex flex-wrap gap-3 pt-1 text-sm text-[var(--muted)]">
              <span>{puzzle.artist}</span>
              <span>·</span>
              <span>{puzzle.era}</span>
              <span>·</span>
              <span>{puzzle.genre}</span>
            </div>
            <p className="text-sm text-[var(--muted)]">
              {guesses.length === 1
                ? 'Got it on the first try.'
                : `Solved in ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}.`}
              {hintsUnlocked > 0 && ` ${hintsUnlocked} hint${hintsUnlocked > 1 ? 's' : ''} used.`}
            </p>
          </div>
        )}

        {/* Lose / give-up state */}
        {isLoseOrGiveUp && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
              {revealed ? 'Answer revealed' : 'Out of guesses'}
            </p>
            <h2
              className="text-2xl font-bold leading-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {puzzle.answer}
            </h2>
            <div className="flex flex-wrap gap-3 pt-1 text-sm text-[var(--muted)]">
              <span>{puzzle.artist}</span>
              <span>·</span>
              <span>{puzzle.era}</span>
              <span>·</span>
              <span>{puzzle.genre}</span>
            </div>
          </div>
        )}

        {/* Divider */}
        <hr className="border-[var(--border)]" />

        {/* Share card */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
            Share your result
          </p>
          <ShareCard
            guesses={guesses}
            hintsUnlocked={hintsUnlocked}
            solved={solved}
            dayIndex={dayIndex}
            formalTitle={puzzle.formal}
          />
        </div>

        {/* Play tomorrow note */}
        <p className="text-xs text-center text-[var(--muted)]">
          A new puzzle arrives at midnight.
        </p>
      </div>
    </div>
  );
}
