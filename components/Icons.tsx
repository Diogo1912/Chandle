/** Inline SVG icons — replaces all emoji usage in the UI */

interface IconProps {
  size?: number;
  className?: string;
}

// ── WhatsNewModal feature icons ──────────────────────────────────

export function MovieClapperIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 20h16a2 2 0 002-2V8H2v10a2 2 0 002 2z" />
      <path d="M2 8h20V6a2 2 0 00-2-2H4a2 2 0 00-2 2v2z" />
      <path d="M6 4l2 4M10 4l2 4M14 4l2 4M18 4l2 4" />
    </svg>
  );
}

export function TrophyIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 21h8M12 17v4M17 4V2H7v2" />
      <path d="M7 4h10v5a5 5 0 01-10 0V4z" />
      <path d="M17 7h2a2 2 0 012 2v0a2 2 0 01-2 2h-2M7 7H5a2 2 0 00-2 2v0a2 2 0 002 2h2" />
    </svg>
  );
}

export function HeadphonesIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 18v-6a9 9 0 0118 0v6" />
      <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" />
    </svg>
  );
}

export function HandshakeIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 11l-2-2-5 5-2-2-5 5" />
      <path d="M4 14l2 2 5-5 2 2 5-5" />
      <path d="M2 10l4-4h3M22 10l-4-4h-3" />
    </svg>
  );
}

export function CalendarIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function SmartphoneIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

// ── Streak / fire icon ───────────────────────────────────────────

export function FireIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2c.5 4-2.5 6-2.5 10a4.5 4.5 0 009 0c0-4-3-4.5-3-8.5C15 2.5 12 2 12 2z" />
      <path d="M12 18a2 2 0 01-2-2c0-1.5 2-2.5 2-5 0 2.5 2 3.5 2 5a2 2 0 01-2 2z" />
    </svg>
  );
}

// ── Badge icons ──────────────────────────────────────────────────

export function TopHatIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 18c0 0 2 2 8 2s8-2 8-2" />
      <rect x="6" y="12" width="12" height="6" rx="1" />
      <path d="M8 12V6a4 4 0 018 0v6" />
    </svg>
  );
}

export function StarIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function GemIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 3h12l4 6-10 13L2 9l4-6z" />
      <path d="M2 9h20" />
      <path d="M12 22L6 9l6-6 6 6-6 13z" />
    </svg>
  );
}

export function CrownIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 20h20M4 17l2-12 6 5 6-5 2 12H4z" />
    </svg>
  );
}

// ── Misc ──────────────────────────────────────────────────────────

export function CameraIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

// Share key icons (HowToModal)
export function SquareGreenIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="var(--green)" />
    </svg>
  );
}

export function SquareRedIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="var(--red)" />
    </svg>
  );
}

export function LightbulbIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" />
    </svg>
  );
}

export function SquareEmptyIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="var(--muted)" strokeWidth="1.5" />
    </svg>
  );
}

// Badge icon lookup map (used by badge system)
export const BADGE_ICONS: Record<string, (props: IconProps) => React.ReactElement> = {
  'streak-3': TopHatIcon,
  'streak-7': FireIcon,
  'streak-14': StarIcon,
  'streak-30': TrophyIcon,
  'streak-60': GemIcon,
  'streak-100': CrownIcon,
};
