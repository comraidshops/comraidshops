'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import DashboardSidebar from '@/components/vendor/DashboardSidebar';
import VendorMobileNav from '@/components/vendor/VendorMobileNav';
import VendorGuard from '@/components/auth/VendorGuard';

interface Notification {
    id: number;
    read: boolean;
}

export default function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/notifications/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const unread = data.filter((n: Notification) => !n.read).length;
                    setUnreadCount(unread);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        const timer = setTimeout(() => {
            setMounted(true);
            fetchUnreadCount();
        }, 0);

        window.addEventListener('notifications_updated', fetchUnreadCount);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('notifications_updated', fetchUnreadCount);
        };
    }, []);

    const pathSegments = (pathname || '').split('/').filter(Boolean);
    const pageName = pathSegments[pathSegments.length - 1] || 'Dashboard';
    const formattedPageName = pageName === 'vendor' ? 'Overview' : pageName.charAt(0).toUpperCase() + pageName.slice(1);

    // Build breadcrumb trail
    const breadcrumbs = pathSegments.slice(2).map((seg, i) => ({
        label: seg === 'vendor' ? 'Dashboard' : seg.charAt(0).toUpperCase() + seg.slice(1),
        href: '/' + pathSegments.slice(0, i + 3).join('/'),
        isLast: i === pathSegments.length - 3
    }));

    // Time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/auth/login';
    };

    return (
        <VendorGuard>
            <div className="min-h-screen bg-secondary/5 flex text-foreground">
                <DashboardSidebar />

                <div className="flex-1 md:ml-64 flex flex-col min-h-screen overflow-x-hidden">
                    {/* Top accent line - thinner and more elegant */}
                    <div className="h-[1px] bg-gradient-to-r from-primary/40 via-primary/20 to-transparent w-full" />

                    <header className="bg-background/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-30 w-full transition-all duration-300">
                        {/* Main header row */}
                        <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8">
                            {/* Mobile: greeting + page name */}
                            <div className="flex flex-col md:hidden">
                                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-secondary/50">
                                    {getGreeting()}
                                </span>
                                <h1 className="font-bold uppercase tracking-tight text-sm leading-tight">
                                    {formattedPageName}
                                </h1>
                            </div>

                            {/* Desktop: breadcrumb - more refined */}
                            <div className="hidden md:flex items-center gap-2">
                                {breadcrumbs.map((crumb, i) => (
                                    <div key={crumb.href} className="flex items-center gap-2">
                                        {i > 0 && <span className="text-secondary/20 font-light">/</span>}
                                        {crumb.isLast ? (
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                                {crumb.label}
                                            </span>
                                        ) : (
                                            <Link href={crumb.href} className="text-[10px] font-bold uppercase tracking-[0.15em] text-secondary/60 hover:text-primary transition-all duration-300">
                                                {crumb.label}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 md:gap-4">
                                <button 
                                    onClick={handleLogout}
                                    className="md:hidden flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-red-500/80 active:scale-95 transition-transform"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    Exit
                                </button>

                                <div className="w-px h-5 bg-border md:hidden" />

                                <Link href="/dashboard/vendor/notifications" className="relative text-secondary hover:text-primary transition-colors block p-1.5 -m-1.5">
                                    <Bell className="w-[18px] h-[18px] md:w-5 md:h-5" />
                                    {mounted && unreadCount > 0 && (
                                        <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[7px] font-bold text-background ring-2 ring-background">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>
                                <div className="h-7 w-7 md:h-8 md:w-8 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold uppercase text-primary">
                                    VS
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 px-4 py-6 pb-28 md:px-10 md:py-10 md:pb-12 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
                        {children}
                    </main>
                </div>
                
                <VendorMobileNav />
            </div>
        </VendorGuard>
    );
}
