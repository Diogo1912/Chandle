'use client';

import { useState, useEffect } from 'react';
import { track } from '@/lib/posthog';

const DISMISS_KEY = 'chandle-install-dismissed';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or already installed
    if (window.localStorage.getItem(DISMISS_KEY)) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Detect iOS Safari
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as Record<string, unknown>).MSStream;
    setIsIOS(ios);

    if (ios) {
      // iOS doesn't have beforeinstallprompt — show manual instructions
      setShowPrompt(true);
      track('install_prompt_shown', { platform: 'ios' });
      return;
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
      track('install_prompt_shown', { platform: 'android' });
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  function dismiss() {
    setShowPrompt(false);
    window.localStorage.setItem(DISMISS_KEY, 'true');
  }

  async function handleInstall() {
    if (deferredPrompt && 'prompt' in deferredPrompt) {
      (deferredPrompt as { prompt: () => Promise<void> }).prompt();
      track('install_prompt_accepted', {});
    }
    dismiss();
  }

  if (!showPrompt) return null;

  return (
    <div className="border border-[var(--border)] px-5 py-4 space-y-3 animate-fade-in">
      <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
        Never miss a puzzle
      </p>
      {isIOS ? (
        <p className="text-sm text-[var(--ink)]">
          Tap <span className="font-medium">Share</span> then <span className="font-medium">Add to Home Screen</span> to install Chandle.
        </p>
      ) : (
        <p className="text-sm text-[var(--ink)]">
          Add Chandle to your home screen for quick access.
        </p>
      )}
      <div className="flex gap-3">
        {!isIOS && (
          <button
            onClick={handleInstall}
            className="
              flex-1 py-2 text-xs font-medium uppercase tracking-wide
              bg-[var(--ink)] text-[var(--bg)] border-2 border-[var(--ink)]
              hover:bg-transparent hover:text-[var(--ink)]
              transition-colors cursor-pointer
            "
          >
            Install
          </button>
        )}
        <button
          onClick={dismiss}
          className="
            flex-1 py-2 text-xs font-medium uppercase tracking-wide
            text-[var(--muted)] border-2 border-[var(--border)]
            hover:border-[var(--ink)] hover:text-[var(--ink)]
            transition-colors cursor-pointer
          "
        >
          {isIOS ? 'Got it' : 'Not now'}
        </button>
      </div>
    </div>
  );
}
