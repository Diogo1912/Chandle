import { puzzles, bonusPuzzles, moviePuzzles, bonusMoviePuzzles } from '@/lib/puzzles';
import ChallengeGame from '@/components/ChallengeGame';
import Link from 'next/link';

export const metadata = {
  title: 'Chandle Challenge',
  description: 'Can you guess this one?',
};

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);

  const allPuzzles = [...puzzles, ...bonusPuzzles, ...moviePuzzles, ...bonusMoviePuzzles];
  const puzzle = allPuzzles.find((p) => p.id === numericId);

  if (!puzzle) {
    return (
      <main className="max-w-xl mx-auto px-5 py-20 text-center space-y-6">
        <h1
          className="text-2xl font-bold tracking-tight uppercase"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Puzzle not found
        </h1>
        <p className="text-sm text-[var(--muted)]">
          This challenge link doesn&apos;t match any puzzle.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-[var(--ink)] text-[var(--bg)] text-sm font-medium tracking-wide uppercase border-2 border-[var(--ink)] hover:bg-transparent hover:text-[var(--ink)] transition-colors"
        >
          Play today&apos;s puzzle
        </Link>
      </main>
    );
  }

  return <ChallengeGame puzzle={puzzle} />;
}
