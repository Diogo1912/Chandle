'use client';

import { useEffect, useState } from 'react';
import { type Puzzle } from '@/lib/puzzles';
import { type GameState } from '@/lib/storage';
import { type EarnedBadge } from '@/lib/badges';
import { buildChallengeUrl } from '@/lib/gameLogic';
import { track } from '@/lib/posthog';
import ShareCard from './ShareCard';
import SongLinks from './SongLinks';
import CountdownTimer from './CountdownTimer';

interface ResultModalProps {
  puzzle: Puzzle;
  state: GameState;
  dayIndex: number;
  streak?: number;
  mode?: 'song' | 'movie';
  newBadges?: EarnedBadge[];
  highestBadge?: EarnedBadge | null;
  onClose: () => void;
}

export default function ResultModal({
  puzzle,
  state,
  dayIndex,
  streak,
  mode,
  newBadges,
  highestBadge,
  onClose,
}: ResultModalProps) {
  const { solved, revealed, guesses, hintsUnlocked } = state;
  const [challengeCopied, setChallengeCopied] = useState(false);

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

  async function handleChallenge() {
    const url = buildChallengeUrl(puzzle.id);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Can you guess this one?', text: 'Try this Chandle puzzle!', url });
      } else {
        await navigator.clipboard.writeText(url);
        setChallengeCopied(true);
        setTimeout(() => setChallengeCopied(false), 2500);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setChallengeCopied(true);
        setTimeout(() => setChallengeCopied(false), 2500);
      } catch { /* ignore */ }
    }
    track('challenge_created', { puzzle_id: puzzle.id });
  }

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
          max-h-[90vh] overflow-y-auto
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
            <SongLinks
              puzzleId={puzzle.id}
              youtubeId={puzzle.youtubeId}
              spotifyId={puzzle.spotifyId}
              imdbId={puzzle.imdbId}
            />
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
            <SongLinks
              puzzleId={puzzle.id}
              youtubeId={puzzle.youtubeId}
              spotifyId={puzzle.spotifyId}
              imdbId={puzzle.imdbId}
            />
          </div>
        )}

        {/* New badge celebration */}
        {newBadges && newBadges.length > 0 && (
          <>
            <hr className="border-[var(--border)]" />
            <div className="text-center space-y-1 py-2">
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--gold)]">
                New badge earned!
              </p>
              {newBadges.map((badge) => (
                <p key={badge.id} className="text-lg">
                  <span className="mr-2">{badge.emoji}</span>
                  <span className="font-semibold" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {badge.name}
                  </span>
                </p>
              ))}
            </div>
          </>
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
            puzzleId={puzzle.id}
            streak={streak}
            mode={mode}
            badgeEmoji={highestBadge?.emoji}
            badgeName={highestBadge?.name}
          />
        </div>

        {/* Challenge a friend */}
        <button
          onClick={handleChallenge}
          className="
            w-full py-2.5
            text-sm font-medium tracking-wide uppercase
            border-2 border-[var(--ink)] text-[var(--ink)]
            hover:bg-[var(--ink)] hover:text-[var(--bg)]
            transition-colors duration-150
            cursor-pointer
          "
        >
          {challengeCopied ? 'Link copied!' : 'Challenge a friend'}
        </button>

        {/* Countdown to next puzzle */}
        <CountdownTimer />
      </div>
    </div>
  );
}
