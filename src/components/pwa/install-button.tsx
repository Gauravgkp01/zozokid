'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function InstallPwaButton() {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    // Show the install prompt
    (installPrompt as any).prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await (installPrompt as any).userChoice;
    // We've used the prompt, and it can't be used again, so nullify it
    setInstallPrompt(null);
  };

  if (!installPrompt) {
    return null;
  }

  return (
    <Button
      variant="outline"
      onClick={handleInstallClick}
      className="rounded-full border-gray-300 text-foreground px-3 sm:px-4"
    >
      <Download className="h-5 w-5 sm:mr-2" />
      <span className="hidden sm:inline">Install App</span>
    </Button>
  );
}
