'use client';

import { useState, useEffect, useCallback } from 'react';
import { puzzles } from '@/lib/puzzles';
import { getDailyPuzzle, getTodayString, isCorrect } from '@/lib/gameLogic';
import { loadState, saveState, freshState, type GameState } from '@/lib/storage';
import GuessInput from './GuessInput';
import HintSystem from './HintSystem';
import ResultModal from './ResultModal';
import HowToModal from './HowToModal';

const MAX_GUESSES = 6;

export default function Game() {
  const [state, setState] = useState<GameState | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [dayIndex, setDayIndex] = useState(0);
  const [puzzle, setPuzzle] = useState(puzzles[0]);
  const [wrongGuessFlash, setWrongGuessFlash] = useState(false);

  // Initialise on client only (localStorage)
  useEffect(() => {
    const today = getTodayString();
    const { puzzle: dailyPuzzle, dayIndex: idx } = getDailyPuzzle(puzzles);
    setPuzzle(dailyPuzzle);
    setDayIndex(idx);

    const stored = loadState(today);
    const initial = stored ?? freshState(today);
    setState(initial);

    // Reopen result modal if game was already finished
    if (initial.solved || initial.revealed || initial.guesses.length >= MAX_GUESSES) {
      setShowResult(true);
    }
  }, []);

  // Persist state whenever it changes
  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  const handleGuess = useCallback((guess: string) => {
    if (!state) return;
    if (state.solved || state.revealed || state.guesses.length >= MAX_GUESSES) return;

    const correct = isCorrect(guess, puzzle);
    const newGuesses = [...state.guesses, guess];

    const nextState: GameState = {
      ...state,
      guesses: newGuesses,
      solved: correct,
    };

    setState(nextState);

    if (correct) {
      // Short delay so player sees their correct guess before the modal
      setTimeout(() => setShowResult(true), 500);
    } else if (newGuesses.length >= MAX_GUESSES) {
      // Auto-show result after exhausting guesses
      setTimeout(() => setShowResult(true), 400);
      setWrongGuessFlash(true);
      setTimeout(() => setWrongGuessFlash(false), 600);
    } else {
      setWrongGuessFlash(true);
      setTimeout(() => setWrongGuessFlash(false), 600);
    }
  }, [state, puzzle]);

  const handleUnlockHint = useCallback(() => {
    if (!state) return;
    if (state.hintsUnlocked >= 4 || state.solved || state.revealed) return;
    setState({ ...state, hintsUnlocked: state.hintsUnlocked + 1 });
  }, [state]);

  const handleGiveUp = useCallback(() => {
    if (!state || state.solved) return;
    setState({ ...state, revealed: true });
    setShowResult(true);
  }, [state]);

  // Don't render until state is hydrated from localStorage
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-[var(--muted)] text-sm tracking-wide">Loading…</span>
      </div>
    );
  }

  const isFinished = state.solved || state.revealed || state.guesses.length >= MAX_GUESSES;
  const wrongGuesses = state.guesses.filter((_, i) =>
    !(i === state.guesses.length - 1 && state.solved)
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
          <span className="text-xs text-[var(--muted)] font-mono">
            #{dayIndex + 1}
          </span>
        </div>
        <button
          onClick={() => setShowHowTo(true)}
          className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors text-lg cursor-pointer"
          aria-label="How to play"
        >
          ≡
        </button>
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="max-w-xl mx-auto px-5 py-10 space-y-10">

        {/* Formal title — hero element */}
        <section aria-label="Today's formal title">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)] mb-4">
            Identify this song
          </p>
          <blockquote
            className="
              text-2xl sm:text-3xl leading-snug font-medium italic text-center
              text-[var(--ink)]
              px-2
            "
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            &ldquo;{puzzle.formal}&rdquo;
          </blockquote>
        </section>

        {/* Difficulty badge */}
        <div className="flex justify-center">
          <span
            className={`
              text-xs px-3 py-1 font-medium uppercase tracking-widest
              ${puzzle.difficulty === 'easy'   ? 'text-[var(--green)]   border border-[var(--green)]'   : ''}
              ${puzzle.difficulty === 'medium' ? 'text-[var(--gold)]    border border-[var(--gold)]'    : ''}
              ${puzzle.difficulty === 'hard'   ? 'text-[var(--red)]     border border-[var(--red)]'     : ''}
            `}
          >
            {puzzle.difficulty}
          </span>
        </div>

        {/* Previous wrong guesses */}
        {wrongGuesses.length > 0 && (
          <section aria-label="Previous guesses">
            <ul className="space-y-1.5">
              {wrongGuesses.map((g, i) => (
                <li
                  key={i}
                  className="
                    flex items-center gap-3 text-sm
                    text-[var(--muted)] line-through
                    animate-slide-down
                  "
                >
                  <span className="text-[var(--red)] text-xs select-none">✗</span>
                  {g}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Input — shown while game is active */}
        {!isFinished && (
          <section aria-label="Guess input">
            <div
              className={`transition-all duration-150 ${wrongGuessFlash ? 'opacity-50' : 'opacity-100'}`}
            >
              <GuessInput onSubmit={handleGuess} disabled={isFinished} />
              <p className="text-xs text-[var(--muted)] mt-3">
                {MAX_GUESSES - state.guesses.length} attempt{MAX_GUESSES - state.guesses.length !== 1 ? 's' : ''} remaining
              </p>
            </div>
          </section>
        )}

        {/* Revealed answer banner (when game over + result modal is closed) */}
        {isFinished && !showResult && (
          <section>
            <div className="border-2 border-[var(--ink)] px-5 py-4 space-y-1">
              <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Answer</p>
              <p
                className="text-xl font-semibold"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {puzzle.answer}
              </p>
              <p className="text-sm text-[var(--muted)]">
                {puzzle.artist} · {puzzle.era}
              </p>
            </div>
            <button
              onClick={() => setShowResult(true)}
              className="mt-3 text-xs underline text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer transition-colors"
            >
              View share card
            </button>
          </section>
        )}

        {/* Hint system */}
        <section
          className="pt-2 border-t border-[var(--border)]"
          aria-label="Hints"
        >
          <HintSystem
            puzzle={puzzle}
            hintsUnlocked={state.hintsUnlocked}
            guessCount={state.guesses.length}
            onUnlockHint={handleUnlockHint}
            solved={state.solved}
            revealed={state.revealed}
          />
        </section>

        {/* Give up */}
        {!isFinished && (
          <div className="pt-2 text-center">
            <button
              onClick={handleGiveUp}
              className="
                text-xs text-[var(--muted)] underline
                hover:text-[var(--red)] transition-colors
                cursor-pointer
              "
            >
              Give up — show the answer
            </button>
          </div>
        )}
      </main>

      {/* ── Modals ─────────────────────────────────────────── */}
      {showResult && (
        <ResultModal
          puzzle={puzzle}
          state={state}
          dayIndex={dayIndex}
          onClose={() => setShowResult(false)}
        />
      )}

      {showHowTo && (
        <HowToModal onClose={() => setShowHowTo(false)} />
      )}
    </>
  );
}
