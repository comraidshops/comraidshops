'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, Clock, Bell, CheckCheck, Sparkles } from 'lucide-react';

interface Notification {
    id: number;
    title: string;
    body: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    unreadCount: number;
    onMarkAllRead: () => void;
    onNotificationClick?: (notification: Notification) => void;
}

function formatRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export default function NotificationModal({ isOpen, onClose, notifications, unreadCount, onMarkAllRead, onNotificationClick }: NotificationModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const backdropVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const panelVariants: Variants = {
        hidden: { opacity: 0, x: 40, scale: 0.98 },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: { type: 'spring', damping: 30, stiffness: 300, mass: 0.8 },
        },
        exit: {
            opacity: 0,
            x: 20,
            scale: 0.97,
            transition: { duration: 0.25, ease: 'easeIn' },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 12 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: 0.08 + (i * 0.05), duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
        }),
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex justify-end"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    {/* Backdrop */}
                    <motion.div
                        variants={backdropVariants}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        ref={panelRef}
                        variants={panelVariants}
                        className="relative w-full max-w-[480px] h-full flex flex-col"
                    >
                        {/* Glass background layers */}
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-3xl" />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-white/[0.02]" />
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-white/15 via-white/5 to-transparent" />

                        {/* Content */}
                        <div className="relative flex flex-col h-full">
                            {/* Header */}
                            <div className="px-6 md:px-8 pt-10 pb-6 border-b border-white/[0.06]">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white/[0.08] border border-white/[0.08] flex items-center justify-center">
                                                <Bell className="w-3.5 h-3.5 text-white/70" />
                                            </div>
                                            {unreadCount > 0 && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400/90 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1"
                                                >
                                                    {unreadCount} New
                                                </motion.span>
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black uppercase tracking-tight text-white/95 leading-none" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 700, fontSize: '1.75rem' }}>
                                                Notifications
                                            </h2>
                                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/25 mt-2">
                                                Activity & Updates
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-9 h-9 flex items-center justify-center text-white/30 hover:text-white/80 hover:bg-white/[0.06] transition-all duration-300 group"
                                    >
                                        <X className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                                    </button>
                                </div>

                                {/* Mark all read */}
                                {unreadCount > 0 && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        onClick={onMarkAllRead}
                                        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white/80 transition-colors group"
                                    >
                                        <CheckCheck className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                                        Mark All as Read
                                    </motion.button>
                                )}
                            </div>

                            {/* Notification List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full py-24 px-8">
                                        <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
                                            <Sparkles className="w-6 h-6 text-white/10" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">
                                            All Clear
                                        </p>
                                        <p className="text-[10px] text-white/15 font-medium text-center max-w-[200px] leading-relaxed">
                                            You&apos;re all caught up. New activity will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        {notifications.map((n, i) => (
                                            <motion.div
                                                key={n.id}
                                                custom={i}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                className={`relative group transition-colors duration-300 cursor-pointer ${
                                                    !n.is_read
                                                        ? 'hover:bg-white/[0.04]'
                                                        : 'hover:bg-white/[0.02]'
                                                }`}
                                                onClick={() => onNotificationClick?.(n)}
                                            >
                                                {/* Unread indicator bar */}
                                                {!n.is_read && (
                                                    <motion.div
                                                        initial={{ scaleY: 0 }}
                                                        animate={{ scaleY: 1 }}
                                                        className="absolute left-0 top-3 bottom-3 w-[2px] bg-gradient-to-b from-white/60 via-white/30 to-transparent origin-top"
                                                    />
                                                )}

                                                <div className="px-6 md:px-8 py-5">
                                                    <div className="flex items-start gap-4">
                                                        {/* Status dot */}
                                                        <div className="pt-1 flex-shrink-0">
                                                            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                                                                !n.is_read
                                                                    ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                                                                    : 'bg-white/15'
                                                            }`} />
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-4 mb-1.5">
                                                                <h4 className={`text-[11px] font-black uppercase tracking-tight leading-tight ${
                                                                    !n.is_read ? 'text-white/90' : 'text-white/50'
                                                                }`}>
                                                                    {n.title}
                                                                </h4>
                                                                <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/20 flex-shrink-0 pt-[2px]">
                                                                    {formatRelativeTime(n.created_at)}
                                                                </span>
                                                            </div>
                                                            <p className={`text-[10px] leading-relaxed font-medium ${
                                                                !n.is_read ? 'text-white/50' : 'text-white/25'
                                                            }`}>
                                                                {n.body}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-2.5">
                                                                <Clock className="w-2.5 h-2.5 text-white/15" />
                                                                <p className="text-[8px] text-white/15 uppercase tracking-[0.2em] font-bold">
                                                                    {new Date(n.created_at).toLocaleDateString('en-GB', {
                                                                        day: '2-digit',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Separator */}
                                                <div className="mx-8 h-px bg-white/[0.04]" />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 md:px-8 py-5 border-t border-white/[0.06]">
                                <p className="text-[7px] font-bold uppercase tracking-[0.3em] text-white/15 text-center">
                                    Comraid Notification Centre · v0.4.2
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
