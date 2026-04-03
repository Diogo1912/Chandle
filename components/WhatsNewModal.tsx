'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { MovieClapperIcon, TrophyIcon, HeadphonesIcon, CalendarIcon, SmartphoneIcon } from './Icons';

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
            v1.2
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
            <span className="shrink-0 text-[var(--ink)]"><MovieClapperIcon size={18} /></span>
            <span>
              <strong className="text-[var(--ink)]">Movie Mode</strong>
              <span className="text-[var(--muted)]"> &mdash; Two daily puzzles: songs AND movies. Switch between them with the new tabs.</span>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 text-[var(--ink)]"><TrophyIcon size={18} /></span>
            <span>
              <strong className="text-[var(--ink)]">Badges</strong>
              <span className="text-[var(--muted)]"> &mdash; Earn streak badges at 3, 7, 14, 30, 60, and 100 days. Check your stats to see them.</span>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 text-[var(--ink)]"><HeadphonesIcon size={18} /></span>
            <span>
              <strong className="text-[var(--ink)]">Listen</strong>
              <span className="text-[var(--muted)]"> &mdash; YouTube, Spotify, and IMDb links after you solve (or give up).</span>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 text-[var(--ink)]"><CalendarIcon size={18} /></span>
            <span>
              <strong className="text-[var(--ink)]">Weekly Recap</strong>
              <span className="text-[var(--muted)]"> &mdash; See your week in review every Sunday. Shareable summary card.</span>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 text-[var(--ink)]"><SmartphoneIcon size={18} /></span>
            <span>
              <strong className="text-[var(--ink)]">Installable</strong>
              <span className="text-[var(--muted)]"> &mdash; Add Chandle to your home screen for instant access.</span>
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
