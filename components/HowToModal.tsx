'use client';

import { useEffect } from 'react';

interface HowToModalProps {
  onClose: () => void;
}

export default function HowToModal({ onClose }: HowToModalProps) {
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

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(26,26,24,0.6)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="How to play"
    >
      {/* Panel */}
      <div
        className="
          relative w-full max-w-sm
          bg-[var(--bg)]
          border-2 border-[var(--ink)]
          p-8 space-y-6
          animate-scale-in
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4
            text-[var(--muted)] hover:text-[var(--ink)]
            text-xl leading-none cursor-pointer transition-colors
          "
          aria-label="Close"
        >
          ×
        </button>

        <h2
          className="text-xl font-semibold"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          How to play
        </h2>

        <ol className="space-y-4 text-sm text-[var(--ink)]">
          <li className="flex gap-3">
            <span className="font-bold text-[var(--gold)] shrink-0">1.</span>
            <span>
              A famous song title has been translated into unnecessarily formal, bureaucratic language.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-[var(--gold)] shrink-0">2.</span>
            <span>
              Type your best guess. Punctuation, articles, and minor spelling variations are forgiven.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-[var(--gold)] shrink-0">3.</span>
            <span>
              Unlock hints one at a time — era, first letters, artist, genre. They cost nothing.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-[var(--gold)] shrink-0">4.</span>
            <span>
              One new puzzle every day. Share your result without spoiling the answer.
            </span>
          </li>
        </ol>

        <hr className="border-[var(--border)]" />

        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">Share key</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--ink)]">
            <span>🟩 Correct</span>
            <span>🟥 Wrong guess</span>
            <span>💡 Hint used</span>
            <span>⬜ Unused slot</span>
          </div>
        </div>

        <button
          onClick={onClose}
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
          Got it
        </button>
      </div>
    </div>
  );
}
