'use client';

import { useState, useEffect, useCallback } from 'react';
import { puzzles, bonusPuzzles } from '@/lib/puzzles';
import { getDailyPuzzle, getTodayString, getWeekString, getWeekBonusPuzzle, isCorrect } from '@/lib/gameLogic';
import {
  loadState, saveState, freshState, type GameState,
  loadBonusState, saveBonusState, freshBonusState, type BonusState,
  loadStats, recordGameResult, type PlayerStats,
} from '@/lib/storage';
import GuessInput from './GuessInput';
import HintSystem from './HintSystem';
import ResultModal from './ResultModal';
import HowToModal from './HowToModal';
import StatsModal from './StatsModal';
import BonusSection from './BonusSection';
import CountdownTimer from './CountdownTimer';
import Link from 'next/link';
import { initPostHog, track } from '@/lib/posthog';

const MAX_GUESSES = 6;

export default function Game() {
  const [state, setState] = useState<GameState | null>(null);
  const [bonusState, setBonusState] = useState<BonusState | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [puzzle, setPuzzle] = useState(puzzles[0]);
  const [bonusPuzzle, setBonusPuzzle] = useState(bonusPuzzles[0]);
  const [dayName, setDayName] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [wrongGuessFlash, setWrongGuessFlash] = useState(false);

  // Initialise on client only (localStorage)
  useEffect(() => {
    const today = getTodayString();
    const week = getWeekString();

    const { puzzle: dailyPuzzle, dayIndex: idx, difficulty: diff, dayName: dName } = getDailyPuzzle(puzzles);
    setPuzzle(dailyPuzzle);
    setDayIndex(idx);
    setDifficulty(diff);
    setDayName(dName);

    const weekBonus = getWeekBonusPuzzle(bonusPuzzles);
    setBonusPuzzle(weekBonus);

    const stored = loadState(today);
    const initial = stored ?? freshState(today);
    setState(initial);

    const storedBonus = loadBonusState(week);
    setBonusState(storedBonus ?? freshBonusState(week));

    // Load persistent stats
    setStats(loadStats());

    if (initial.solved || initial.revealed || initial.guesses.length >= MAX_GUESSES) {
      setShowResult(true);
    }

    initPostHog();
    track('puzzle_viewed', {
      puzzle_id: dailyPuzzle.id,
      puzzle_difficulty: dailyPuzzle.difficulty,
      puzzle_day: new Date().toISOString().split('T')[0],
    });
  }, []);

  // Persist main state
  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  // Persist bonus state
  useEffect(() => {
    if (bonusState) saveBonusState(bonusState);
  }, [bonusState]);

  const handleGuess = useCallback((guess: string) => {
    if (!state) return;
    if (state.solved || state.revealed || state.guesses.length >= MAX_GUESSES) return;

    const correct = isCorrect(guess, puzzle);
    const newGuesses = [...state.guesses, guess];
    // Auto-unlock one hint per wrong guess (up to 4), so all hints are visible by guess 5+
    const newHintsUnlocked = correct
      ? state.hintsUnlocked
      : Math.min(newGuesses.length, 4);
    const nextState: GameState = { ...state, guesses: newGuesses, solved: correct, hintsUnlocked: newHintsUnlocked };
    setState(nextState);

    track('guess_attempted', {
      puzzle_id: puzzle.id,
      attempt_number: newGuesses.length,
      was_correct: correct,
      hints_used_so_far: newHintsUnlocked,
    });

    if (correct) {
      track('puzzle_solved', {
        puzzle_id: puzzle.id,
        attempts: newGuesses.length,
        hints_used: newHintsUnlocked,
        difficulty: puzzle.difficulty,
        solved_without_hints: newHintsUnlocked === 0,
      });
      // Record stats
      const today = getTodayString();
      const updatedStats = recordGameResult(today, true, newGuesses.length);
      setStats(updatedStats);
      setTimeout(() => setShowResult(true), 500);
    } else {
      // Fire hint_unlocked if a new hint became available
      if (newHintsUnlocked > state.hintsUnlocked) {
        const hintTypes = ['era', 'genre', 'initials', 'artist'];
        track('hint_unlocked', {
          puzzle_id: puzzle.id,
          hint_number: newHintsUnlocked,
          hint_type: hintTypes[newHintsUnlocked - 1],
          attempts_at_time: newGuesses.length,
        });
      }
      if (newGuesses.length >= MAX_GUESSES) {
        // Record stats — lost by running out of guesses
        const today = getTodayString();
        const updatedStats = recordGameResult(today, false, newGuesses.length);
        setStats(updatedStats);
        setTimeout(() => setShowResult(true), 400);
      }
    }
    setWrongGuessFlash(true);
    setTimeout(() => setWrongGuessFlash(false), 600);
  }, [state, puzzle]);

  const handleGiveUp = useCallback(() => {
    if (!state || state.solved) return;
    track('puzzle_given_up', {
      puzzle_id: puzzle.id,
      attempts: state.guesses.length,
      hints_used: state.hintsUnlocked,
    });
    setState({ ...state, revealed: true });
    // Record stats — gave up
    const today = getTodayString();
    const updatedStats = recordGameResult(today, false, state.guesses.length);
    setStats(updatedStats);
    setShowResult(true);
  }, [state, puzzle]);

  if (!state || !bonusState) {
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

  const difficultyColor = {
    easy:   'text-[var(--green)] border-[var(--green)]',
    medium: 'text-[var(--gold)]  border-[var(--gold)]',
    hard:   'text-[var(--red)]   border-[var(--red)]',
  }[difficulty];

  return (
    <>
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1
            className="text-xl font-bold tracking-tight uppercase"
            style={{ fontFamily: 'var(--font-playfair)', letterSpacing: '0.08em' }}
          >
            Chandle
          </h1>
          <span className="text-xs text-[var(--muted)] font-mono">#{dayIndex + 1}</span>
          {dayName && (
            <span className={`text-xs px-2 py-0.5 border font-medium uppercase tracking-wider ${difficultyColor}`}>
              {dayName} · {difficulty}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Streak badge */}
          {stats && stats.currentStreak > 0 && (
            <button
              onClick={() => setShowStats(true)}
              className="flex items-center gap-1 text-sm text-[var(--gold)] hover:text-[var(--ink)] transition-colors cursor-pointer"
              aria-label={`${stats.currentStreak} day streak. View stats.`}
              title="View stats"
            >
              <span>&#128293;</span>
              <span className="font-mono font-semibold text-xs">{stats.currentStreak}</span>
            </button>
          )}
          {/* Stats button */}
          <button
            onClick={() => setShowStats(true)}
            className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors text-base cursor-pointer"
            aria-label="Statistics"
            title="Statistics"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="1" y="10" width="4" height="7" rx="0.5" />
              <rect x="7" y="4" width="4" height="13" rx="0.5" />
              <rect x="13" y="1" width="4" height="16" rx="0.5" />
            </svg>
          </button>
          {/* How to play */}
          <button
            onClick={() => setShowHowTo(true)}
            className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors text-lg cursor-pointer"
            aria-label="How to play"
          >
            &#8801;
          </button>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="max-w-xl mx-auto px-5 py-10 space-y-10">

        {/* Formal title — hero element */}
        <section aria-label="Today's formal title">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)] mb-4">
            Identify this song
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
                  <span className="text-[var(--red)] text-xs select-none">✗</span>
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
                {MAX_GUESSES - state.guesses.length} attempt{MAX_GUESSES - state.guesses.length !== 1 ? 's' : ''} remaining
              </p>
            </div>
          </section>
        )}

        {/* Answer banner after game ends (when modal is closed) */}
        {isFinished && !showResult && (
          <section>
            <div className="border-2 border-[var(--ink)] px-5 py-4 space-y-1">
              <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Answer</p>
              <p className="text-xl font-semibold" style={{ fontFamily: 'var(--font-playfair)' }}>
                {puzzle.answer}
              </p>
              <p className="text-sm text-[var(--muted)]">{puzzle.artist} · {puzzle.era}</p>
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
        <section className="pt-2 border-t border-[var(--border)]" aria-label="Hints">
          <HintSystem
            puzzle={puzzle}
            hintsUnlocked={state.hintsUnlocked}
            guessCount={state.guesses.length}
            solved={state.solved}
            revealed={state.revealed}
          />
        </section>

        {/* Give up */}
        {!isFinished && (
          <div className="pt-2 text-center">
            <button
              onClick={handleGiveUp}
              className="text-xs text-[var(--muted)] underline hover:text-[var(--red)] transition-colors cursor-pointer"
            >
              Give up — show the answer
            </button>
          </div>
        )}

        {/* ── Bonus puzzle — only after game ends ── */}
        {isFinished && (
          <BonusSection
            puzzle={bonusPuzzle}
            state={bonusState}
            onStateChange={(next) => setBonusState(next)}
          />
        )}

        {/* Countdown + archive link — shown after game ends */}
        {isFinished && (
          <div className="space-y-4 pt-2">
            <CountdownTimer />
            <div className="text-center">
              <Link
                href="/archive"
                className="text-xs text-[var(--muted)] underline hover:text-[var(--ink)] transition-colors"
              >
                Play past puzzles &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* GDPR notice */}
        <p className="text-center text-[10px] text-[var(--muted)] pt-4">
          This site uses anonymous analytics to improve the game.
        </p>
      </main>

      {/* ── Modals ─────────────────────────────────────────── */}
      {showResult && (
        <ResultModal
          puzzle={puzzle}
          state={state}
          dayIndex={dayIndex}
          streak={stats?.currentStreak}
          onClose={() => setShowResult(false)}
        />
      )}
      {showHowTo && (
        <HowToModal onClose={() => setShowHowTo(false)} />
      )}
      {showStats && stats && (
        <StatsModal stats={stats} onClose={() => setShowStats(false)} />
      )}
    </>
  );
}
