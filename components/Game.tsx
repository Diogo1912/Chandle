'use client';

import { useState, useEffect, useCallback } from 'react';
import { puzzles, bonusPuzzles, moviePuzzles, bonusMoviePuzzles } from '@/lib/puzzles';
import {
  getDailyPuzzle, getDailyMoviePuzzle,
  getTodayString, getWeekString,
  getWeekBonusPuzzle, getWeekBonusMoviePuzzle,
  isCorrect,
} from '@/lib/gameLogic';
import {
  loadState, saveState, freshState, type GameState,
  loadMovieState, saveMovieState,
  loadBonusState, saveBonusState, freshBonusState, type BonusState,
  loadMovieBonusState, saveMovieBonusState,
  loadStats, recordGameResult, type PlayerStats,
} from '@/lib/storage';
import { type EarnedBadge, getHighestBadge } from '@/lib/badges';
import GuessInput from './GuessInput';
import HintSystem from './HintSystem';
import ResultModal from './ResultModal';
import HowToModal from './HowToModal';
import StatsModal from './StatsModal';
import BonusSection from './BonusSection';
import CountdownTimer from './CountdownTimer';
import WhatsNewModal from './WhatsNewModal';
import ModeTabs from './ModeTabs';
import WeeklyRecapModal from './WeeklyRecapModal';
import InstallPrompt from './InstallPrompt';
import { FireIcon } from './Icons';
import Link from 'next/link';
import { initPostHog, track } from '@/lib/posthog';

const MAX_GUESSES = 6;

type GameMode = 'song' | 'movie';

export default function Game() {
  // ── Mode ────────────────────────────────────────────────
  const [mode, setMode] = useState<GameMode>('song');

  // ── Song state ──────────────────────────────────────────
  const [songState, setSongState] = useState<GameState | null>(null);
  const [songBonusState, setSongBonusState] = useState<BonusState | null>(null);
  const [songPuzzle, setSongPuzzle] = useState(puzzles[0]);
  const [songBonusPuzzle, setSongBonusPuzzle] = useState(bonusPuzzles[0]);

  // ── Movie state ─────────────────────────────────────────
  const [movieState, setMovieState] = useState<GameState | null>(null);
  const [movieBonusState, setMovieBonusState] = useState<BonusState | null>(null);
  const [moviePuzzle, setMoviePuzzle] = useState(moviePuzzles[0]);
  const [movieBonusPuzzle, setMovieBonusPuzzle] = useState(bonusMoviePuzzles[0]);

  // ── Shared state ────────────────────────────────────────
  const [showResult, setShowResult] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showWeeklyRecap, setShowWeeklyRecap] = useState(false);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [dayName, setDayName] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [wrongGuessFlash, setWrongGuessFlash] = useState(false);
  const [newBadges, setNewBadges] = useState<EarnedBadge[]>([]);

  // Derived: active puzzle and state based on mode
  const state = mode === 'song' ? songState : movieState;
  const setState = mode === 'song' ? setSongState : setMovieState;
  const puzzle = mode === 'song' ? songPuzzle : moviePuzzle;
  const bonusState = mode === 'song' ? songBonusState : movieBonusState;
  const setBonusState = mode === 'song' ? setSongBonusState : setMovieBonusState;
  const bonusPuzzleActive = mode === 'song' ? songBonusPuzzle : movieBonusPuzzle;

  // ── Initialise on client ────────────────────────────────
  useEffect(() => {
    const today = getTodayString();
    const week = getWeekString();

    // Song puzzle
    const { puzzle: dailySong, dayIndex: idx, difficulty: diff, dayName: dName } = getDailyPuzzle(puzzles);
    setSongPuzzle(dailySong);
    setDayIndex(idx);
    setDifficulty(diff);
    setDayName(dName);
    setSongBonusPuzzle(getWeekBonusPuzzle(bonusPuzzles));

    const storedSong = loadState(today);
    const initialSong = storedSong ?? freshState(today);
    setSongState(initialSong);
    setSongBonusState(loadBonusState(week) ?? freshBonusState(week));

    // Movie puzzle
    const { puzzle: dailyMovie } = getDailyMoviePuzzle(moviePuzzles);
    setMoviePuzzle(dailyMovie);
    setMovieBonusPuzzle(getWeekBonusMoviePuzzle(bonusMoviePuzzles));

    const storedMovie = loadMovieState(today);
    const initialMovie = storedMovie ?? freshState(today);
    setMovieState(initialMovie);
    setMovieBonusState(loadMovieBonusState(week) ?? freshBonusState(week));

    // Stats
    setStats(loadStats());

    // Auto-open result if song puzzle is already finished
    if (initialSong.solved || initialSong.revealed || initialSong.guesses.length >= MAX_GUESSES) {
      setShowResult(true);
    }

    initPostHog();
    track('puzzle_viewed', {
      puzzle_id: dailySong.id,
      puzzle_difficulty: dailySong.difficulty,
      puzzle_day: new Date().toISOString().split('T')[0],
    });

    // Show "What's New" popup once for v1.2
    const WHATS_NEW_KEY = 'chandle-whats-new-v1.2';
    if (!window.localStorage.getItem(WHATS_NEW_KEY)) {
      setShowWhatsNew(true);
      window.localStorage.setItem(WHATS_NEW_KEY, 'seen');
    }
  }, []);

  // ── Persist state ───────────────────────────────────────
  useEffect(() => {
    if (songState) saveState(songState);
  }, [songState]);

  useEffect(() => {
    if (movieState) saveMovieState(movieState);
  }, [movieState]);

  useEffect(() => {
    if (songBonusState) saveBonusState(songBonusState);
  }, [songBonusState]);

  useEffect(() => {
    if (movieBonusState) saveMovieBonusState(movieBonusState);
  }, [movieBonusState]);

  // ── Mode switching ──────────────────────────────────────
  const handleModeChange = useCallback((newMode: GameMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setShowResult(false);
    setWrongGuessFlash(false);

    track('mode_switched', { from: mode, to: newMode });

    // If the new mode's puzzle is already finished, show result
    const targetState = newMode === 'song' ? songState : movieState;
    if (targetState && (targetState.solved || targetState.revealed || targetState.guesses.length >= MAX_GUESSES)) {
      setTimeout(() => setShowResult(true), 100);
    }
  }, [mode, songState, movieState]);

  // ── Guess handler ───────────────────────────────────────
  const handleGuess = useCallback((guess: string) => {
    if (!state) return;
    if (state.solved || state.revealed || state.guesses.length >= MAX_GUESSES) return;

    const correct = isCorrect(guess, puzzle);
    const newGuesses = [...state.guesses, guess];
    const newHintsUnlocked = correct
      ? state.hintsUnlocked
      : Math.min(newGuesses.length, 4);
    const nextState: GameState = { ...state, guesses: newGuesses, solved: correct, hintsUnlocked: newHintsUnlocked };
    setState(nextState);

    track('guess_attempted', {
      puzzle_id: puzzle.id,
      mode,
      attempt_number: newGuesses.length,
      was_correct: correct,
      hints_used_so_far: newHintsUnlocked,
    });

    if (correct) {
      track('puzzle_solved', {
        puzzle_id: puzzle.id,
        mode,
        attempts: newGuesses.length,
        hints_used: newHintsUnlocked,
        difficulty: puzzle.difficulty,
        solved_without_hints: newHintsUnlocked === 0,
      });
      const today = getTodayString();
      const { stats: updatedStats, newBadges: earned } = recordGameResult(today, true, newGuesses.length, newHintsUnlocked, puzzle.id);
      setStats(updatedStats);
      if (earned.length > 0) setNewBadges(earned);
      setTimeout(() => setShowResult(true), 500);
    } else {
      if (newHintsUnlocked > state.hintsUnlocked) {
        const hintTypes = ['era', 'genre', 'initials', mode === 'movie' ? 'director' : 'artist'];
        track('hint_unlocked', {
          puzzle_id: puzzle.id,
          hint_number: newHintsUnlocked,
          hint_type: hintTypes[newHintsUnlocked - 1],
          attempts_at_time: newGuesses.length,
        });
      }
      if (newGuesses.length >= MAX_GUESSES) {
        const today = getTodayString();
        const { stats: updatedStats, newBadges: earned } = recordGameResult(today, false, newGuesses.length, newHintsUnlocked, puzzle.id);
        setStats(updatedStats);
        if (earned.length > 0) setNewBadges(earned);
        setTimeout(() => setShowResult(true), 400);
      }
    }
    setWrongGuessFlash(true);
    setTimeout(() => setWrongGuessFlash(false), 600);
  }, [state, puzzle, mode, setState]);

  // ── Give up handler ─────────────────────────────────────
  const handleGiveUp = useCallback(() => {
    if (!state || state.solved) return;
    track('puzzle_given_up', {
      puzzle_id: puzzle.id,
      mode,
      attempts: state.guesses.length,
      hints_used: state.hintsUnlocked,
    });
    setState({ ...state, revealed: true });
    const today = getTodayString();
    const { stats: updatedStats, newBadges: earned } = recordGameResult(today, false, state.guesses.length, state.hintsUnlocked, puzzle.id);
    setStats(updatedStats);
    if (earned.length > 0) setNewBadges(earned);
    setShowResult(true);
  }, [state, puzzle, mode, setState]);

  // ── Handle result modal close — trigger weekly recap on Sunday ──
  const handleResultClose = useCallback(() => {
    setShowResult(false);
    const isSunday = new Date().getDay() === 0;
    if (isSunday && !showWeeklyRecap) {
      setTimeout(() => setShowWeeklyRecap(true), 300);
    }
  }, [showWeeklyRecap]);

  // ── Loading state ───────────────────────────────────────
  if (!songState || !movieState || !songBonusState || !movieBonusState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-[var(--muted)] text-sm tracking-wide">Loading…</span>
      </div>
    );
  }

  const isFinished = state!.solved || state!.revealed || state!.guesses.length >= MAX_GUESSES;
  const wrongGuesses = state!.guesses.filter((_, i) =>
    !(i === state!.guesses.length - 1 && state!.solved)
  );

  const songFinished = songState.solved || songState.revealed || songState.guesses.length >= MAX_GUESSES;
  const movieFinished = movieState.solved || movieState.revealed || movieState.guesses.length >= MAX_GUESSES;

  const difficultyColor = {
    easy:   'text-[var(--green)] border-[var(--green)]',
    medium: 'text-[var(--gold)]  border-[var(--gold)]',
    hard:   'text-[var(--red)]   border-[var(--red)]',
  }[difficulty];

  const modeLabel = mode === 'movie' ? 'movie' : 'song';
  const highestBadge = stats ? getHighestBadge(stats.badges) : null;

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
              <FireIcon size={16} />
              <span className="font-mono font-semibold text-xs">{stats.currentStreak}</span>
            </button>
          )}
          {/* Archive */}
          <Link
            href="/archive"
            className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            aria-label="Past puzzles"
            title="Past puzzles"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="14" height="14" rx="1.5" />
              <line x1="2" y1="6.5" x2="16" y2="6.5" />
              <line x1="6" y1="2" x2="6" y2="6.5" />
              <line x1="12" y1="2" x2="12" y2="6.5" />
              <circle cx="9" cy="11.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </Link>
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

      {/* ── Mode Tabs ──────────────────────────────────────── */}
      <ModeTabs
        mode={mode}
        onModeChange={handleModeChange}
        songFinished={songFinished}
        movieFinished={movieFinished}
      />

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="max-w-xl mx-auto px-5 py-10 space-y-10">

        {/* Formal title — hero element */}
        <section aria-label={`Today's formal ${modeLabel} title`}>
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)] mb-4">
            Identify this {modeLabel}
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
                {MAX_GUESSES - state!.guesses.length} attempt{MAX_GUESSES - state!.guesses.length !== 1 ? 's' : ''} remaining
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
            hintsUnlocked={state!.hintsUnlocked}
            guessCount={state!.guesses.length}
            solved={state!.solved}
            revealed={state!.revealed}
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
            puzzle={bonusPuzzleActive}
            state={bonusState!}
            onStateChange={(next) => setBonusState(next)}
          />
        )}

        {/* Countdown — shown after game ends */}
        {isFinished && (
          <div className="pt-2">
            <CountdownTimer />
          </div>
        )}

        {/* Install prompt — shown after game ends */}
        {isFinished && <InstallPrompt />}

        {/* GDPR notice */}
        <p className="text-center text-[10px] text-[var(--muted)] pt-4">
          This site uses anonymous analytics to improve the game.
        </p>
      </main>

      {/* ── Modals ─────────────────────────────────────────── */}
      {showResult && state && (
        <ResultModal
          puzzle={puzzle}
          state={state}
          dayIndex={dayIndex}
          streak={stats?.currentStreak}
          mode={mode}
          newBadges={newBadges}
          highestBadge={highestBadge}
          onClose={handleResultClose}
        />
      )}
      {showHowTo && (
        <HowToModal onClose={() => setShowHowTo(false)} />
      )}
      {showStats && stats && (
        <StatsModal stats={stats} onClose={() => setShowStats(false)} />
      )}
      {showWhatsNew && (
        <WhatsNewModal onClose={() => setShowWhatsNew(false)} />
      )}
      {showWeeklyRecap && stats && (
        <WeeklyRecapModal
          currentStreak={stats.currentStreak}
          onClose={() => setShowWeeklyRecap(false)}
        />
      )}
    </>
  );
}
