'use client';

import { track } from '@/lib/posthog';

interface SongLinksProps {
  puzzleId: number;
  youtubeId?: string;
  spotifyId?: string;
  imdbId?: string;
}

export default function SongLinks({ puzzleId, youtubeId, spotifyId, imdbId }: SongLinksProps) {
  if (!youtubeId && !spotifyId && !imdbId) return null;

  function handleClick(platform: string) {
    track('song_link_clicked', { puzzle_id: puzzleId, platform });
  }

  return (
    <div className="flex gap-3 pt-1">
      {youtubeId && (
        <a
          href={`https://www.youtube.com/watch?v=${youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick('youtube')}
          className="
            flex items-center gap-1.5 px-3 py-1.5
            text-xs font-medium uppercase tracking-wider
            border border-[var(--border)] text-[var(--muted)]
            hover:text-[var(--ink)] hover:border-[var(--ink)]
            transition-colors
          "
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          YouTube
        </a>
      )}
      {spotifyId && (
        <a
          href={`https://open.spotify.com/track/${spotifyId}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick('spotify')}
          className="
            flex items-center gap-1.5 px-3 py-1.5
            text-xs font-medium uppercase tracking-wider
            border border-[var(--border)] text-[var(--muted)]
            hover:text-[var(--ink)] hover:border-[var(--ink)]
            transition-colors
          "
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Spotify
        </a>
      )}
      {imdbId && (
        <a
          href={`https://www.imdb.com/title/${imdbId}/`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick('imdb')}
          className="
            flex items-center gap-1.5 px-3 py-1.5
            text-xs font-medium uppercase tracking-wider
            border border-[var(--border)] text-[var(--muted)]
            hover:text-[var(--ink)] hover:border-[var(--ink)]
            transition-colors
          "
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 3.75v16.5h24V3.75H0zm3.6 13.5H1.8V6.75h1.8v10.5zm5.4 0H7.05V6.75H8.1l.9 4.05.9-4.05h1.05v10.5h-1.8v-6l-.75 3.75h-.75L6.9 11.25v6h-.9zm7.2 0h-3.6V6.75h3.6c.9 0 1.35.6 1.35 1.5v7.5c0 .9-.45 1.5-1.35 1.5zm-.45-9h-.9v7.5h.9V8.25zm3.45 9h-1.8V6.75h3.15c.9 0 1.35.6 1.35 1.5v2.25c0 .75-.3 1.2-.75 1.35.45.15.75.6.75 1.35v4.05h-1.8v-3.75h-.9v3.75zm0-9h.9v2.25h-.9V8.25z"/>
          </svg>
          IMDb
        </a>
      )}
    </div>
  );
}
