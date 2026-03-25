"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePWA } from "@/context/PWAContext";

export default function InstallPrompt() {
  const { isInstallable, isStandalone, isIOS, installApp, clearPrompt, manualShowPrompt, setManualShowPrompt } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (isStandalone) return;

    if (isInstallable || manualShowPrompt) {
      setShowPrompt(true);
    } else if (isIOS) {
      // Show iOS instruction after a short delay
      const hasSeenIOSPrompt = localStorage.getItem('hasSeenIOSPrompt');
      if (!hasSeenIOSPrompt) {
        const timer = setTimeout(() => setShowPrompt(true), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [isInstallable, isStandalone, isIOS]);

  const handleInstallClick = async () => {
    await installApp();
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
    setManualShowPrompt(false);
    clearPrompt();
    if (isIOS) {
      localStorage.setItem('hasSeenIOSPrompt', 'true');
    }
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-24 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-96 z-50 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-black rounded-xl overflow-hidden flex items-center justify-center border border-neutral-800">
              <img src="/logo-white.png" alt="App Icon" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h3 className="text-white font-medium">Install ComraidShops</h3>
              <p className="text-neutral-400 text-sm mt-0.5">
                {isIOS ? 'Add to home screen for a better experience.' : 'Install our app for faster access.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          {isIOS ? (
            <div className="bg-neutral-800/50 rounded-lg p-3 text-sm text-neutral-300 flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <span>1. Tap on the</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15V3m0 0l4 4m-4-4L8 7" />
                  <path d="M4 11v6a2 2 0 002 2h12a2 2 0 002-2v-6" />
                </svg>
                <span>Share button</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>2. Select</span>
                <span className="font-semibold text-white">"Add to Home Screen"</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center space-x-2 bg-white text-black font-medium rounded-xl py-2.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Install App</span>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
