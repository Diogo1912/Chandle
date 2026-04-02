'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Puzzle } from '@/lib/puzzles';
import { isCorrect, buildChallengeUrl } from '@/lib/gameLogic';
import {
  loadChallenges,
  saveChallengeEntry,
  type ChallengeEntry,
} from '@/lib/storage';
import GuessInput from '@/components/GuessInput';
import HintSystem from '@/components/HintSystem';
import SongLinks from '@/components/SongLinks';
import Link from 'next/link';

const MAX_GUESSES = 6;

interface ChallengeGameProps {
  puzzle: Puzzle;
}

export default function ChallengeGame({ puzzle }: ChallengeGameProps) {
  const [entry, setEntry] = useState<ChallengeEntry | null>(null);
  const [wrongGuessFlash, setWrongGuessFlash] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Load saved challenge state ────────────────────────────
  useEffect(() => {
    const challenges = loadChallenges();
    const saved = challenges[puzzle.id];
    if (saved) {
      setEntry(saved);
    } else {
      setEntry({
        puzzleId: puzzle.id,
        guesses: [],
        hintsUnlocked: 0,
        solved: false,
        revealed: false,
      });
    }
  }, [puzzle.id]);

  // ── Persist state ─────────────────────────────────────────
  useEffect(() => {
    if (entry) saveChallengeEntry(entry);
  }, [entry]);

  // ── Guess handler ─────────────────────────────────────────
  const handleGuess = useCallback(
    (guess: string) => {
      if (!entry) return;
      if (entry.solved || entry.revealed || entry.guesses.length >= MAX_GUESSES) return;

      const correct = isCorrect(guess, puzzle);
      const newGuesses = [...entry.guesses, guess];
      const newHintsUnlocked = correct
        ? entry.hintsUnlocked
        : Math.min(newGuesses.length, 4);

      setEntry({
        ...entry,
        guesses: newGuesses,
        solved: correct,
        hintsUnlocked: newHintsUnlocked,
      });

      setWrongGuessFlash(true);
      setTimeout(() => setWrongGuessFlash(false), 600);
    },
    [entry, puzzle],
  );

  // ── Give up handler ───────────────────────────────────────
  const handleGiveUp = useCallback(() => {
    if (!entry || entry.solved) return;
    setEntry({ ...entry, revealed: true });
  }, [entry]);

  // ── Share handler ─────────────────────────────────────────
  const handleShare = useCallback(() => {
    const url = buildChallengeUrl(puzzle.id);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [puzzle.id]);

  // ── Loading state ─────────────────────────────────────────
  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-[var(--muted)] text-sm tracking-wide">Loading...</span>
      </div>
    );
  }

  const isFinished = entry.solved || entry.revealed || entry.guesses.length >= MAX_GUESSES;
  const wrongGuesses = entry.guesses.filter(
    (_, i) => !(i === entry.guesses.length - 1 && entry.solved),
  );

  return (
    <>
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-baseline gap-3">
          <h1
            className="text-xl font-bold tracking-tight uppercase"
            style={{ fontFamily: 'var(--font-playfair)', letterSpacing: '0.08em' }}
          >
            Chandle
          </h1>
          <span className="text-xs text-[var(--gold)] font-medium uppercase tracking-wider">
            Challenge
          </span>
        </div>
        <Link
          href="/"
          className="text-xs text-[var(--muted)] underline hover:text-[var(--ink)] transition-colors"
        >
          Daily puzzle
        </Link>
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="max-w-xl mx-auto px-5 py-10 space-y-10">
        {/* Formal title */}
        <section aria-label="Challenge formal title">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)] mb-4">
            Identify this {puzzle.type === 'movie' ? 'movie' : 'song'}
          </p>
          <blockquote
            className="text-2xl sm:text-3xl leading-snug font-medium italic text-center text-[var(--ink)] px-2"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            &ldquo;{puzzle.formal}&rdquo;
          </blockquote>
        </section>

        {/* Previous wrong guesses */}
        {wrongGuesses.length > 0 && (
          <section aria-label="Previous guesses">
            <ul className="space-y-1.5">
              {wrongGuesses.map((g, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-[var(--muted)] line-through animate-slide-down"
                >
                  <span className="text-[var(--red)] text-xs select-none">&#10007;</span>
                  {g}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Input */}
        {!isFinished && (
          <section aria-label="Guess input">
            <div className={`transition-all duration-150 ${wrongGuessFlash ? 'opacity-50' : 'opacity-100'}`}>
              <GuessInput onSubmit={handleGuess} disabled={isFinished} />
              <p className="text-xs text-[var(--muted)] mt-3">
                {MAX_GUESSES - entry.guesses.length} attempt
                {MAX_GUESSES - entry.guesses.length !== 1 ? 's' : ''} remaining
              </p>
            </div>
          </section>
        )}

        {/* Result banner after game ends */}
        {isFinished && (
          <section>
            <div
              className={`border-2 px-5 py-4 space-y-1 ${
                entry.solved
                  ? 'border-[var(--green)]'
                  : 'border-[var(--red)]'
              }`}
            >
              <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
                {entry.solved ? 'Correct!' : 'Answer'}
              </p>
              <p
                className="text-xl font-semibold"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {puzzle.answer}
              </p>
              <p className="text-sm text-[var(--muted)]">
                {puzzle.artist} &middot; {puzzle.era}
              </p>
            </div>

            {/* Song/movie links */}
            <div className="mt-3">
              <SongLinks
                puzzleId={puzzle.id}
                youtubeId={puzzle.youtubeId}
                spotifyId={puzzle.spotifyId}
                imdbId={puzzle.imdbId}
              />
            </div>

            {/* Actions after game */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="
                  inline-block text-center
                  px-6 py-2.5
                  bg-[var(--ink)] text-[var(--bg)]
                  text-sm font-medium tracking-wide uppercase
                  border-2 border-[var(--ink)]
                  hover:bg-transparent hover:text-[var(--ink)]
                  transition-colors
                "
              >
                Play today&apos;s puzzle
              </Link>
              <button
                onClick={handleShare}
                className="
                  px-6 py-2.5
                  bg-transparent text-[var(--ink)]
                  text-sm font-medium tracking-wide uppercase
                  border-2 border-[var(--ink)]
                  hover:bg-[var(--ink)] hover:text-[var(--bg)]
                  transition-colors cursor-pointer
                "
              >
                {copied ? 'Copied!' : 'Share challenge'}
              </button>
            </div>
          </section>
        )}

        {/* Hint system */}
        <section className="pt-2 border-t border-[var(--border)]" aria-label="Hints">
          <HintSystem
            puzzle={puzzle}
            hintsUnlocked={entry.hintsUnlocked}
            guessCount={entry.guesses.length}
            solved={entry.solved}
            revealed={entry.revealed}
          />
        </section>

        {/* Give up */}
        {!isFinished && (
          <div className="pt-2 text-center">
            <button
              onClick={handleGiveUp}
              className="text-xs text-[var(--muted)] underline hover:text-[var(--red)] transition-colors cursor-pointer"
            >
              Give up &mdash; show the answer
            </button>
          </div>
        )}
      </main>
    </>
  );
}
