'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstallable: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  manualShowPrompt: boolean;
  setManualShowPrompt: (show: boolean) => void;
  installApp: () => Promise<void>;
  clearPrompt: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [manualShowPrompt, setManualShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check iOS / iPadOS robustly
    const checkIsIOS = () => {
      const ua = window.navigator.userAgent;
      const platform = window.navigator.platform;
      const ios = /iPad|iPhone|iPod/.test(ua) || 
                  (platform === 'MacIntel' && window.navigator.maxTouchPoints > 1) ||
                  (/iPad|iPhone|iPod/.test(platform));
      return !!ios;
    };
    
    const ios = checkIsIOS();
    setIsIOS(ios);
    console.log('[PWA] Device Detection:', { ios, standalone });

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA] beforeinstallprompt event captured');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = async () => {
      console.log('[PWA] appinstalled event captured');
      setDeferredPrompt(null);
      
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/track/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_type: 'pwa_install' }),
        });
      } catch (err) {
        console.error('Failed to track PWA install', err);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', handleAppInstalled as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled as any);
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const clearPrompt = () => {
    setDeferredPrompt(null);
  };

  return (
    <PWAContext.Provider value={{ 
      deferredPrompt, 
      isInstallable: !!deferredPrompt, 
      isStandalone, 
      isIOS,
      manualShowPrompt,
      setManualShowPrompt,
      installApp,
      clearPrompt
    }}>
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};
