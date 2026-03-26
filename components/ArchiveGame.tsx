'use client';

import { useState, useEffect, useCallback } from 'react';
import { puzzles } from '@/lib/puzzles';
import { getPastPuzzles, isCorrect } from '@/lib/gameLogic';
import { loadArchive, saveArchiveEntry, type ArchiveEntry } from '@/lib/storage';
import GuessInput from './GuessInput';
import HintSystem from './HintSystem';
import Link from 'next/link';

const MAX_GUESSES = 6;

type PastPuzzle = ReturnType<typeof getPastPuzzles>[number];

export default function ArchiveGame() {
  const [pastPuzzles, setPastPuzzles] = useState<PastPuzzle[]>([]);
  const [archive, setArchive] = useState<Record<number, ArchiveEntry>>({});
  const [selectedPuzzle, setSelectedPuzzle] = useState<PastPuzzle | null>(null);
  const [currentEntry, setCurrentEntry] = useState<ArchiveEntry | null>(null);
  const [wrongGuessFlash, setWrongGuessFlash] = useState(false);

  useEffect(() => {
    setPastPuzzles(getPastPuzzles(puzzles));
    setArchive(loadArchive());
  }, []);

  const selectPuzzle = useCallback((pp: PastPuzzle) => {
    setSelectedPuzzle(pp);
    const existing = archive[pp.puzzle.id];
    setCurrentEntry(existing ?? {
      puzzleId: pp.puzzle.id,
      guesses: [],
      hintsUnlocked: 0,
      solved: false,
      revealed: false,
    });
  }, [archive]);

  const handleGuess = useCallback((guess: string) => {
    if (!currentEntry || !selectedPuzzle) return;
    if (currentEntry.solved || currentEntry.revealed || currentEntry.guesses.length >= MAX_GUESSES) return;

    const correct = isCorrect(guess, selectedPuzzle.puzzle);
    const newGuesses = [...currentEntry.guesses, guess];
    const newHintsUnlocked = correct
      ? currentEntry.hintsUnlocked
      : Math.min(newGuesses.length, 4);

    const updated: ArchiveEntry = {
      ...currentEntry,
      guesses: newGuesses,
      solved: correct,
      hintsUnlocked: newHintsUnlocked,
    };

    setCurrentEntry(updated);
    saveArchiveEntry(updated);
    setArchive(prev => ({ ...prev, [updated.puzzleId]: updated }));

    setWrongGuessFlash(true);
    setTimeout(() => setWrongGuessFlash(false), 600);
  }, [currentEntry, selectedPuzzle]);

  const handleGiveUp = useCallback(() => {
    if (!currentEntry || !selectedPuzzle || currentEntry.solved) return;
    const updated: ArchiveEntry = { ...currentEntry, revealed: true };
    setCurrentEntry(updated);
    saveArchiveEntry(updated);
    setArchive(prev => ({ ...prev, [updated.puzzleId]: updated }));
  }, [currentEntry, selectedPuzzle]);

  const diffColors: Record<string, string> = {
    easy: 'text-[var(--green)] border-[var(--green)]',
    medium: 'text-[var(--gold)] border-[var(--gold)]',
    hard: 'text-[var(--red)] border-[var(--red)]',
  };

  // ── Playing a selected puzzle ──
  if (selectedPuzzle && currentEntry) {
    const puzzle = selectedPuzzle.puzzle;
    const isFinished = currentEntry.solved || currentEntry.revealed || currentEntry.guesses.length >= MAX_GUESSES;
    const wrongGuesses = currentEntry.guesses.filter((_, i) =>
      !(i === currentEntry.guesses.length - 1 && currentEntry.solved)
    );

    return (
      <>
        <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-baseline gap-3 flex-wrap">
            <button
              onClick={() => { setSelectedPuzzle(null); setCurrentEntry(null); }}
              className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            >
              &larr; Back
            </button>
            <span className="text-xs text-[var(--muted)] font-mono">#{selectedPuzzle.dayIndex + 1}</span>
            <span className="text-xs text-[var(--muted)]">{formatDate(selectedPuzzle.date)}</span>
            <span className={`text-xs px-2 py-0.5 border font-medium uppercase tracking-wider ${diffColors[selectedPuzzle.difficulty]}`}>
              {selectedPuzzle.difficulty}
            </span>
          </div>
        </header>

        <main className="max-w-xl mx-auto px-5 py-10 space-y-10">
          <section aria-label="Puzzle title">
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)] mb-4">
              Archive Puzzle
            </p>
            <blockquote
              className="text-2xl sm:text-3xl leading-snug font-medium italic text-center text-[var(--ink)] px-2"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              &ldquo;{puzzle.formal}&rdquo;
            </blockquote>
          </section>

          {/* Wrong guesses */}
          {wrongGuesses.length > 0 && (
            <section aria-label="Previous guesses">
              <ul className="space-y-1.5">
                {wrongGuesses.map((g, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[var(--muted)] line-through animate-slide-down">
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
                  {MAX_GUESSES - currentEntry.guesses.length} attempt{MAX_GUESSES - currentEntry.guesses.length !== 1 ? 's' : ''} remaining
                </p>
              </div>
            </section>
          )}

          {/* Result */}
          {isFinished && (
            <section>
              <div className={`border-2 px-5 py-4 space-y-1 ${currentEntry.solved ? 'border-[var(--green)]' : 'border-[var(--ink)]'}`}>
                <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
                  {currentEntry.solved ? 'Correct!' : currentEntry.revealed ? 'Answer revealed' : 'Out of guesses'}
                </p>
                <p className="text-xl font-semibold" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {puzzle.answer}
                </p>
                <p className="text-sm text-[var(--muted)]">{puzzle.artist} &middot; {puzzle.era}</p>
              </div>
            </section>
          )}

          {/* Hints */}
          <section className="pt-2 border-t border-[var(--border)]" aria-label="Hints">
            <HintSystem
              puzzle={puzzle}
              hintsUnlocked={currentEntry.hintsUnlocked}
              guessCount={currentEntry.guesses.length}
              solved={currentEntry.solved}
              revealed={currentEntry.revealed}
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

          <p className="text-center text-[10px] text-[var(--muted)] pt-4">
            Archive puzzles don&apos;t count toward your streak.
          </p>
        </main>
      </>
    );
  }

  // ── Puzzle list ──
  return (
    <>
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-baseline gap-3">
          <h1
            className="text-xl font-bold tracking-tight uppercase"
            style={{ fontFamily: 'var(--font-playfair)', letterSpacing: '0.08em' }}
          >
            Archive
          </h1>
        </div>
        <Link
          href="/"
          className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          &larr; Today&apos;s puzzle
        </Link>
      </header>

      <main className="max-w-xl mx-auto px-5 py-8">
        <p className="text-sm text-[var(--muted)] mb-6">
          Play puzzles you missed. Archive results don&apos;t affect your streak.
        </p>

        {pastPuzzles.length === 0 ? (
          <p className="text-sm text-[var(--muted)] text-center py-12">
            No past puzzles yet. Come back tomorrow!
          </p>
        ) : (
          <div className="space-y-1">
            {pastPuzzles.map((pp) => {
              const entry = archive[pp.puzzle.id];
              const status = entry?.solved ? 'solved' : entry?.revealed || (entry && entry.guesses.length >= MAX_GUESSES) ? 'failed' : entry ? 'in-progress' : 'new';

              return (
                <button
                  key={pp.dayIndex}
                  onClick={() => selectPuzzle(pp)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-[var(--border)] hover:border-[var(--ink)] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[var(--muted)] w-8">#{pp.dayIndex + 1}</span>
                    <span className="text-sm text-[var(--ink)] group-hover:text-[var(--ink)]">
                      {formatDate(pp.date)}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 border font-medium uppercase tracking-wider ${diffColors[pp.difficulty]}`}>
                      {pp.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {status === 'solved' && (
                      <span className="text-xs text-[var(--green)] font-medium">
                        &#10003; {entry!.guesses.length}/{MAX_GUESSES}
                      </span>
                    )}
                    {status === 'failed' && (
                      <span className="text-xs text-[var(--red)] font-medium">&#10007;</span>
                    )}
                    {status === 'in-progress' && (
                      <span className="text-xs text-[var(--gold)] font-medium">...</span>
                    )}
                    {status === 'new' && (
                      <span className="text-xs text-[var(--muted)]">&rarr;</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
