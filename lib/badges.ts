export interface Badge {
  id: string;
  name: string;
  emoji: string;
  threshold: number;
}

export interface EarnedBadge extends Badge {
  earnedAt: string; // YYYY-MM-DD
}

export const BADGE_CATALOG: Badge[] = [
  { id: 'streak-3',   threshold: 3,   name: 'Hat Trick',    emoji: '\u{1F3A9}' },
  { id: 'streak-7',   threshold: 7,   name: 'Week Warrior', emoji: '\u{1F525}' },
  { id: 'streak-14',  threshold: 14,  name: 'Fortnight',    emoji: '\u{2B50}' },
  { id: 'streak-30',  threshold: 30,  name: 'Iron Will',    emoji: '\u{1F3C6}' },
  { id: 'streak-60',  threshold: 60,  name: 'Relentless',   emoji: '\u{1F48E}' },
  { id: 'streak-100', threshold: 100, name: 'Centurion',    emoji: '\u{1F451}' },
];

export function getHighestBadge(badges: EarnedBadge[]): EarnedBadge | null {
  if (!badges || badges.length === 0) return null;
  return badges.reduce((best, b) => b.threshold > best.threshold ? b : best);
}

export function getNextBadge(currentStreak: number): Badge | null {
  return BADGE_CATALOG.find(b => b.threshold > currentStreak) ?? null;
}

export function checkNewBadges(currentStreak: number, existingBadges: EarnedBadge[], todayStr: string): EarnedBadge[] {
  const newBadges: EarnedBadge[] = [];
  for (const badge of BADGE_CATALOG) {
    if (currentStreak >= badge.threshold && !existingBadges.find(b => b.id === badge.id)) {
      newBadges.push({ ...badge, earnedAt: todayStr });
    }
  }
  return newBadges;
}
