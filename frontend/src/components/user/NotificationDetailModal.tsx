'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Bell, Eye } from 'lucide-react';

interface Notification {
    id: number;
    title: string;
    body: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationDetailModalProps {
    isOpen: boolean;
    notification: Notification | null;
    onClose: () => void;
}

function formatFullDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function formatFullTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return formatFullDate(dateStr);
}

export default function NotificationDetailModal({ isOpen, notification, onClose }: NotificationDetailModalProps) {
    // Close on escape
    const handleEsc = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEsc]);

    if (!notification) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    {/* Backdrop */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1 },
                        }}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: {
                                type: 'spring',
                                damping: 28,
                                stiffness: 280,
                                mass: 0.8,
                                delay: 0.05,
                            },
                        }}
                        exit={{
                            opacity: 0,
                            y: 20,
                            scale: 0.97,
                            transition: { duration: 0.2, ease: 'easeIn' },
                        }}
                        className="relative w-full max-w-[580px] max-h-[85vh] flex flex-col overflow-hidden"
                    >
                        {/* Glass background layers */}
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.03]" />

                        {/* Border effects */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
                        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-white/15 via-white/3 to-transparent" />

                        {/* Corner accent */}
                        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-white/[0.06] to-transparent" />

                        {/* Content wrapper */}
                        <div className="relative flex flex-col h-full">
                            {/* Header */}
                            <div className="px-8 md:px-10 pt-8 md:pt-10 pb-6 border-b border-white/[0.06]">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                                            <Bell className="w-4 h-4 text-white/50" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/25">
                                                Notification Detail
                                            </span>
                                            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/15 mt-0.5">
                                                ID #{notification.id.toString().padStart(4, '0')}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-9 h-9 flex items-center justify-center text-white/25 hover:text-white/80 hover:bg-white/[0.06] transition-all duration-300 group flex-shrink-0"
                                    >
                                        <X className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                                    </button>
                                </div>
                            </div>

                            {/* Body — scrollable */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-10 py-8 md:py-10">
                                {/* Status indicator */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="flex items-center gap-2.5 mb-6"
                                >
                                    <div className={`w-2 h-2 rounded-full ${
                                        !notification.is_read
                                            ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                                            : 'bg-white/20'
                                    }`} />
                                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${
                                        !notification.is_read
                                            ? 'text-white/70'
                                            : 'text-white/30'
                                    }`}>
                                        {!notification.is_read ? 'Unread' : 'Read'}
                                    </span>
                                    <div className="flex-1 h-px bg-white/[0.06]" />
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="w-2.5 h-2.5 text-white/15" />
                                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">
                                            {formatRelativeTime(notification.created_at)}
                                        </span>
                                    </div>
                                </motion.div>

                                {/* Title */}
                                <motion.h2
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                                    className="text-white/95 leading-[1.15] mb-6 font-black uppercase tracking-tight"
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontStyle: 'italic',
                                        fontWeight: 700,
                                        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                                    }}
                                >
                                    {notification.title}
                                </motion.h2>

                                {/* Divider */}
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
                                    className="h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent mb-8 origin-left"
                                />

                                {/* Body text */}
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                                    className="space-y-4"
                                >
                                    <p className="text-white/55 text-sm md:text-[15px] leading-[1.85] font-medium tracking-wide">
                                        {notification.body}
                                    </p>
                                </motion.div>
                            </div>

                            {/* Footer */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.45 }}
                                className="px-8 md:px-10 py-5 border-t border-white/[0.06] flex items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-white/15" />
                                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/20">
                                            {formatFullDate(notification.created_at)}
                                        </span>
                                    </div>
                                    <span className="text-white/10">·</span>
                                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/20">
                                        {formatFullTime(notification.created_at)}
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white/70 transition-colors duration-300 flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-4 py-2"
                                >
                                    Close
                                </button>
                            </motion.div>
                        </div>

                        {/* Ambient glow effect */}
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
