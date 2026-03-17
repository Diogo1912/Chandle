'use client';

import { useState } from 'react';
import { buildShareText } from '@/lib/gameLogic';

interface ShareCardProps {
  guesses: string[];
  hintsUnlocked: number;
  solved: boolean;
  dayIndex: number;
  formalTitle: string;
}

export default function ShareCard({
  guesses,
  hintsUnlocked,
  solved,
  dayIndex,
  formalTitle,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const text = buildShareText({ guesses, hintsUnlocked, solved, dayIndex, formalTitle });

  async function handleCopy() {
    if (copied) return; // debounce double-clicks

    let success = false;
    try {
      await navigator.clipboard.writeText(text);
      success = true;
    } catch {
      // Safari fallback via execCommand
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        success = true;
      } catch {
        // Copy unavailable — silently ignore
      }
    }

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="space-y-3">
      {/* Preview of share text */}
      <pre
        className="
          text-sm font-mono bg-[var(--card)]
          border border-[var(--border)]
          px-4 py-3
          whitespace-pre-wrap leading-relaxed
          text-[var(--ink)]
          select-all
        "
        aria-label="Share card preview"
      >
        {text}
      </pre>

      <button
        onClick={handleCopy}
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
        {copied ? 'Copied!' : 'Copy result'}
      </button>
    </div>
  );
}
