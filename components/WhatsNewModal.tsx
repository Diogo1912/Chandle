'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface WhatsNewModalProps {
  onClose: () => void;
}

export default function WhatsNewModal({ onClose }: WhatsNewModalProps) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(26,26,24,0.6)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="What's new"
    >
      <div
        className="relative w-full max-w-sm bg-[var(--bg)] border-2 border-[var(--ink)] p-8 space-y-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--ink)] text-xl leading-none cursor-pointer transition-colors"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Version badge */}
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border-2 border-[var(--gold)] text-[var(--gold)]"
          >
            v1.1
          </span>
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            What&rsquo;s new
          </h2>
        </div>

        <ul className="space-y-4 text-sm text-[var(--ink)]">
          <li className="flex gap-3">
            <span className="text-base shrink-0">&#128293;</span>
            <span>
              <strong className="text-[var(--ink)]">Streaks</strong>
              <span className="text-[var(--muted)]"> &mdash; Play every day to build your streak. Miss a day and it resets.</span>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-base shrink-0">&#128202;</span>
            <span>
              <strong className="text-[var(--ink)]">Statistics</strong>
              <span className="text-[var(--muted)]"> &mdash; Track your win rate, best streak, and guess distribution.</span>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-base shrink-0">&#128230;</span>
            <span>
              <strong className="text-[var(--ink)]">Archive</strong>
              <span className="text-[var(--muted)]"> &mdash; Missed a day? Go back and play any past puzzle.</span>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-base shrink-0">&#9203;</span>
            <span>
              <strong className="text-[var(--ink)]">Countdown</strong>
              <span className="text-[var(--muted)]"> &mdash; See exactly when the next puzzle drops.</span>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-base shrink-0">&#128279;</span>
            <span>
              <strong className="text-[var(--ink)]">Better sharing</strong>
              <span className="text-[var(--muted)]"> &mdash; Share card now shows your streak.</span>
            </span>
          </li>
        </ul>

        <hr className="border-[var(--border)]" />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="
              flex-1 py-2.5
              bg-[var(--ink)] text-[var(--bg)]
              text-sm font-medium tracking-wide uppercase
              border-2 border-[var(--ink)]
              hover:bg-transparent hover:text-[var(--ink)]
              transition-colors duration-150
              cursor-pointer
            "
          >
            Let&rsquo;s play
          </button>
          <Link
            href="/archive"
            onClick={onClose}
            className="
              flex-1 py-2.5 text-center
              bg-transparent text-[var(--ink)]
              text-sm font-medium tracking-wide uppercase
              border-2 border-[var(--ink)]
              hover:bg-[var(--ink)] hover:text-[var(--bg)]
              transition-colors duration-150
            "
          >
            Archive
          </Link>
        </div>
      </div>
    </div>
  );
}
