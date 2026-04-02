'use client';

interface ModeTabsProps {
  mode: 'song' | 'movie';
  onModeChange: (mode: 'song' | 'movie') => void;
  songFinished: boolean;
  movieFinished: boolean;
}

export default function ModeTabs({ mode, onModeChange, songFinished, movieFinished }: ModeTabsProps) {
  return (
    <div className="flex justify-center border-b border-[var(--border)]">
      <button
        onClick={() => onModeChange('song')}
        className={`
          relative px-6 py-3 text-xs font-medium uppercase tracking-widest
          transition-colors cursor-pointer
          ${mode === 'song' ? 'text-[var(--ink)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'}
        `}
      >
        Songs
        {songFinished && <span className="ml-1.5 text-[var(--green)]">&#10003;</span>}
        {mode === 'song' && (
          <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--gold)]" />
        )}
      </button>
      <button
        onClick={() => onModeChange('movie')}
        className={`
          relative px-6 py-3 text-xs font-medium uppercase tracking-widest
          transition-colors cursor-pointer
          ${mode === 'movie' ? 'text-[var(--ink)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'}
        `}
      >
        Movies
        {movieFinished && <span className="ml-1.5 text-[var(--green)]">&#10003;</span>}
        {mode === 'movie' && (
          <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--gold)]" />
        )}
      </button>
    </div>
  );
}
