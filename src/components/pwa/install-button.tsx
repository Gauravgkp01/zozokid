'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function InstallPwaButton() {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      // Hide the app-provided install promotion
      setInstallPrompt(null);
      setIsAppInstalled(true);
    };

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    const promptEvent = installPrompt as any;
    // Show the install prompt
    promptEvent.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await promptEvent.userChoice;
    // We've used the prompt, and can't use it again, so clear it
    if (outcome === 'accepted' || outcome === 'dismissed') {
      setInstallPrompt(null);
    }
  };

  // If no prompt is available, or the app is already installed, do not show the button.
  if (!installPrompt || isAppInstalled) {
    return null;
  }

  return (
    <Button
      variant="outline"
      onClick={handleInstallClick}
      title="Install App"
      className="rounded-full border-gray-300 text-foreground px-3 sm:px-4"
    >
      <Download className="h-5 w-5 sm:mr-2" />
      <span className="hidden sm:inline">Install App</span>
    </Button>
  );
}
