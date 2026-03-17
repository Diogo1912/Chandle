'use client';

import { useState, useRef } from 'react';

interface GuessInputProps {
  onSubmit: (guess: string) => void;
  disabled: boolean;
}

export default function GuessInput({ onSubmit, disabled }: GuessInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
      <div className="flex-1">
        <input
          ref={inputRef}
          type="text"
          className="guess-input"
          placeholder="Type the song title…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Song title guess"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="
          w-full sm:w-auto
          px-6 py-2.5
          bg-[var(--ink)] text-[var(--bg)]
          text-sm font-medium tracking-wide uppercase
          border-2 border-[var(--ink)]
          disabled:opacity-40 disabled:cursor-not-allowed
          hover:bg-transparent hover:text-[var(--ink)]
          transition-colors duration-150
          cursor-pointer
        "
      >
        Guess
      </button>
    </div>
  );
}
