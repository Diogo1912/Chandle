'use client';

import { useEffect } from 'react';
import { type PlayerStats } from '@/lib/storage';

interface StatsModalProps {
  stats: PlayerStats;
  onClose: () => void;
}

export default function StatsModal({ stats, onClose }: StatsModalProps) {
  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const winPct = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  const maxGuessCount = Math.max(...stats.guessDistribution, 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(26,26,24,0.6)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Your statistics"
    >
      <div
        className="relative w-full max-w-sm bg-[var(--bg)] border-2 border-[var(--ink)] p-8 space-y-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--ink)] text-xl leading-none cursor-pointer transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        <h2
          className="text-lg font-bold uppercase tracking-widest text-center"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Statistics
        </h2>

        {/* Summary row */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <StatBox value={stats.gamesPlayed} label="Played" />
          <StatBox value={winPct} label="Win %" />
          <StatBox
            value={stats.currentStreak}
            label="Streak"
            highlight={stats.currentStreak > 0}
          />
          <StatBox value={stats.maxStreak} label="Best" />
        </div>

        <hr className="border-[var(--border)]" />

        {/* Guess distribution */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
            Guess Distribution
          </p>

          {stats.gamesPlayed === 0 ? (
            <p className="text-sm text-[var(--muted)] text-center py-4">
              No data yet. Play your first game!
            </p>
          ) : (
            <div className="space-y-1.5">
              {stats.guessDistribution.map((count, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-mono w-3 text-right text-[var(--muted)]">
                    {i + 1}
                  </span>
                  <div
                    className="h-5 flex items-center justify-end px-1.5 text-xs font-medium transition-all duration-300"
                    style={{
                      width: `${Math.max((count / maxGuessCount) * 100, count > 0 ? 8 : 2)}%`,
                      backgroundColor: count > 0 ? 'var(--green)' : 'var(--card)',
                      color: count > 0 ? 'var(--bg)' : 'var(--muted)',
                      minWidth: '1.5rem',
                    }}
                  >
                    {count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Streak encouragement */}
        {stats.currentStreak > 0 && (
          <>
            <hr className="border-[var(--border)]" />
            <p className="text-sm text-center text-[var(--muted)]">
              {stats.currentStreak === 1
                ? 'Come back tomorrow to start building a streak!'
                : stats.currentStreak >= 7
                  ? `${stats.currentStreak} days straight. Legendary.`
                  : `${stats.currentStreak} days and counting. Don't break it!`}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function StatBox({ value, label, highlight }: { value: number; label: string; highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <p
        className={`text-2xl font-bold ${highlight ? 'text-[var(--gold)]' : 'text-[var(--ink)]'}`}
        style={{ fontFamily: 'var(--font-playfair)' }}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{label}</p>
    </div>
  );
}
