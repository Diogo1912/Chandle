import posthog from 'posthog-js';

export const initPostHog = () => {
  if (typeof window === 'undefined') return;
  if (posthog.__loaded) return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false, // we'll capture manually
    capture_pageleave: true,
    persistence: 'localStorage',
    autocapture: false, // only track what we explicitly define
  });
};

export const track = (event: string, properties?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;
  if (!posthog.__loaded) return;
  posthog.capture(event, properties);
};
