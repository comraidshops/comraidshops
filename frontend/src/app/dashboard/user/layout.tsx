'use client';

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import UserSidebar from '@/components/user/UserSidebar';
import NotificationModal from '@/components/user/NotificationModal';
import UserGuard from '@/components/auth/UserGuard';
import { LogOut, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';

interface Notification {
    id: number;
    title: string;
    body: string;
    is_read: boolean;
    created_at: string;
}

interface DashboardNotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAllRead: () => void;
    refreshNotifications: () => void;
}

const DashboardNotificationContext = createContext<DashboardNotificationContextType>({
    notifications: [],
    unreadCount: 0,
    markAllRead: () => {},
    refreshNotifications: () => {},
});

export function useDashboardNotifications() {
    return useContext(DashboardNotificationContext);
}

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const parts = (pathname || '').split('/');
    const pageName = parts[parts.length - 1] === 'user' ? 'Account Overview' : parts[parts.length - 1];
    const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const lastNotificationId = useRef<number>(0);

    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/user/notifications/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const d = await res.json();
                const list: Notification[] = Array.isArray(d) ? d : d.results ?? [];
                setNotifications(list);
                setUnreadCount(list.filter((n) => !n.is_read).length);
                if (list.length > 0) {
                    lastNotificationId.current = Math.max(...list.map(n => n.id));
                }
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAllRead = async () => {
        const token = localStorage.getItem('access_token');
        await fetch(`${API_BASE_URL}/user/notifications/mark_all_read/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(n => n.map(x => ({ ...x, is_read: true })));
        setUnreadCount(0);
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/auth/login';
    };

    return (
        <UserGuard>
            <DashboardNotificationContext.Provider value={{ notifications, unreadCount, markAllRead, refreshNotifications: fetchNotifications }}>
                <div className="min-h-screen bg-background flex text-foreground selection:bg-foreground selection:text-background">
                    <UserSidebar />

                    <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
                        <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 sticky top-0 z-30 w-full">
                            <div className="flex items-center gap-5">
                                {/* Notification Bell — Top Left */}
                                <button
                                    id="notification-bell"
                                    onClick={() => setIsNotifOpen(true)}
                                    className="relative w-10 h-10 flex items-center justify-center hover:bg-secondary/5 transition-all duration-300 group border border-transparent hover:border-border"
                                >
                                    <Bell className="w-4 h-4 text-secondary/60 group-hover:text-foreground transition-colors duration-300" />
                                    <AnimatePresence>
                                        {unreadCount > 0 && (
                                            <motion.span
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-foreground text-background text-[8px] font-black flex items-center justify-center rounded-full shadow-lg ring-2 ring-background"
                                            >
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                    {/* Subtle pulse when unread */}
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-foreground/30 rounded-full animate-ping" />
                                    )}
                                </button>

                                <div className="h-6 w-px bg-border hidden md:block" />

                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-secondary/50 leading-none mb-1">Navigation</span>
                                    <h1 className="font-black uppercase tracking-tight text-[10px] md:text-xs">
                                        {formattedPageName}
                                    </h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-secondary/50 leading-none mb-1">Local Time</span>
                                    <span className="text-[10px] font-bold tracking-tighter">03:32 GMT+1</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="md:hidden flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-red-500"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    Sign Out
                                </button>
                                <div className="h-9 w-9 bg-foreground text-background flex items-center justify-center text-[10px] font-black uppercase shadow-xl">
                                    US
                                </div>
                            </div>
                        </header>

                        <main className="flex-1 p-6 md:p-12 pb-32 md:pb-12 max-w-7xl mx-auto w-full relative">
                            {children}
                        </main>
                    </div>
                </div>

                {/* Notification Glass Modal */}
                <NotificationModal
                    isOpen={isNotifOpen}
                    onClose={() => setIsNotifOpen(false)}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAllRead={markAllRead}
                />
            </DashboardNotificationContext.Provider>
        </UserGuard>
    );
}
