'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function InstallPwaButton() {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsAppInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if the app is already running in standalone mode (installed)
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

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
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    // The prompt can only be used once.
    if(outcome === 'accepted' || outcome === 'dismissed') {
        setInstallPrompt(null);
    }
  };

  // If the app is already installed, don't show the button.
  if (isAppInstalled) {
    return null;
  }

  return (
    <Button
      variant="outline"
      onClick={handleInstallClick}
      disabled={!installPrompt}
      title={!installPrompt ? "App installation is not available in this browser." : "Install App"}
      className="rounded-full border-gray-300 text-foreground px-3 sm:px-4"
    >
      <Download className="h-5 w-5 sm:mr-2" />
      <span className="hidden sm:inline">Install App</span>
    </Button>
  );
}
