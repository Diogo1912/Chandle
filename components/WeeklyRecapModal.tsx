'use client';

import { useEffect, useState } from 'react';
import { loadHistory } from '@/lib/storage';
import { buildWeeklyRecap, buildWeeklyShareText, type WeeklyRecap } from '@/lib/gameLogic';
import { track } from '@/lib/posthog';
import { FireIcon } from './Icons';

interface WeeklyRecapModalProps {
  currentStreak: number;
  onClose: () => void;
}

export default function WeeklyRecapModal({ currentStreak, onClose }: WeeklyRecapModalProps) {
  const [recap, setRecap] = useState<WeeklyRecap | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const history = loadHistory();
    const r = buildWeeklyRecap(history, currentStreak);
    setRecap(r);
    if (r) {
      track('weekly_recap_viewed', { days_played: r.daysPlayed, days_won: r.daysWon });
    }
  }, [currentStreak]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!recap) {
    // No history for last week — close immediately
    onClose();
    return null;
  }

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  async function handleShare() {
    if (!recap) return;
    const text = buildWeeklyShareText(recap);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
    track('weekly_recap_shared', { days_played: recap.daysPlayed, days_won: recap.daysWon });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(26,26,24,0.6)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Weekly recap"
    >
      <div
        className="relative w-full max-w-sm bg-[var(--bg)] border-2 border-[var(--ink)] p-8 space-y-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--ink)] text-xl leading-none cursor-pointer transition-colors"
          aria-label="Close"
        >
          &times;
        </button>

        <div className="space-y-1">
          <h2
            className="text-lg font-bold uppercase tracking-widest text-center"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Your Week
          </h2>
          <p className="text-xs text-[var(--muted)] text-center">{recap.weekLabel}</p>
        </div>

        {/* Day grid */}
        <div className="flex justify-center gap-2">
          {recap.results.map((result, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-[var(--muted)] uppercase">{dayLabels[i]}</span>
              <div
                className="w-8 h-8 flex items-center justify-center text-sm"
                style={{
                  backgroundColor: !result ? 'var(--card)' : result.solved ? 'var(--green)' : 'var(--red)',
                  color: !result ? 'var(--muted)' : 'var(--bg)',
                }}
              >
                {!result ? '–' : result.solved ? result.guessCount : '✗'}
              </div>
            </div>
          ))}
        </div>

        <hr className="border-[var(--border)]" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
              {recap.daysPlayed}/7
            </p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Played</p>
          </div>
          <div>
            <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
              {recap.daysWon}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Won</p>
          </div>
          <div>
            <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
              {recap.bestSolveGuesses ?? '–'}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Best</p>
          </div>
        </div>

        {currentStreak > 1 && (
          <p className="text-sm text-center text-[var(--muted)]">
            <FireIcon size={16} className="inline -mt-0.5 mr-1" />{currentStreak} day streak
          </p>
        )}

        <button
          onClick={handleShare}
          className="
            w-full py-2.5
            bg-[var(--ink)] text-[var(--bg)]
            text-sm font-medium tracking-wide uppercase
            border-2 border-[var(--ink)]
            hover:bg-transparent hover:text-[var(--ink)]
            transition-colors duration-150
            cursor-pointer
          "
        >
          {copied ? 'Copied!' : 'Share your week'}
        </button>
      </div>
    </div>
  );
}
