'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface NotificationContextType {
    notify: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const notify = useCallback((type: 'success' | 'error' | 'info', title: string, message: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications((prev) => [...prev, { id, title, message, type }]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000); // Increased duration for readability
    }, []);

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <div className="fixed top-4 right-4 left-4 md:left-auto md:top-12 md:right-12 z-[100] flex flex-col gap-4 pointer-events-none">
                <AnimatePresence>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
                            className="pointer-events-auto relative group overflow-hidden"
                        >
                            {/* Glass Background */}
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)]" />
                            
                            {/* Glowing Edge Gradient */}
                            <div className={`absolute inset-0 rounded-2xl border-l-[3px] opacity-80 ${
                                n.type === 'error' ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 
                                n.type === 'info' ? 'border-blue-400/50 shadow-[0_0_15px_rgba(96,165,250,0.2)]' : 
                                'border-green-400/50 shadow-[0_0_15px_rgba(74,222,128,0.2)]'
                            }`} />

                            <div className="relative px-5 py-4 md:px-7 md:py-5 flex items-center gap-4 md:gap-5 min-w-0 w-full md:min-w-[380px] md:max-w-[480px]">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                    n.type === 'error' ? 'bg-red-500/10 text-red-500' : 
                                    n.type === 'info' ? 'bg-blue-400/10 text-blue-400' : 
                                    'bg-green-400/10 text-green-400'
                                }`}>
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                
                                <div className="flex-1">
                                    <p className="font-inter text-[10px] font-black uppercase tracking-[0.25em] text-white/90 mb-1">{n.title}</p>
                                    <p className="text-xs text-white/40 font-medium leading-relaxed">{n.message}</p>
                                </div>

                                <button 
                                    onClick={() => removeNotification(n.id)} 
                                    className="text-white/20 hover:text-white transition-colors p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Shimmer sweep effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
