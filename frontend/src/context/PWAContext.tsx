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

    // Check iOS
    const platform = window.navigator?.platform || '';
    const ios = /iPad|iPhone|iPod/.test(platform) ||
                (window.navigator?.userAgent?.includes("Mac") && "ontouchend" in document);
    setIsIOS(!!ios);

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
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
