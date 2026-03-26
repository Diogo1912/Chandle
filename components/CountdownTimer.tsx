'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function calcTimeLeft() {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diff / 3_600_000);
      const mins = Math.floor((diff % 3_600_000) / 60_000);
      const secs = Math.floor((diff % 60_000) / 1_000);

      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    setTimeLeft(calcTimeLeft());
    const interval = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) return null;

  return (
    <div className="text-center space-y-1">
      <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
        Next puzzle in
      </p>
      <p
        className="text-xl font-mono font-semibold tracking-wider text-[var(--ink)]"
        aria-live="polite"
        aria-label={`Next puzzle in ${timeLeft}`}
      >
        {timeLeft}
      </p>
    </div>
  );
}
