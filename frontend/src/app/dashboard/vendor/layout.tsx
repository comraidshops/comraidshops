'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import DashboardSidebar from '@/components/vendor/DashboardSidebar';
import VendorGuard from '@/components/auth/VendorGuard';

export default function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
        const fetchUnreadCount = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/notifications/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const unread = data.filter((n: any) => !n.read).length;
                    setUnreadCount(unread);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };
        fetchUnreadCount();
    }, []);

    const pageName = pathname.split('/').pop() || 'Dashboard';
    const formattedPageName = pageName === 'vendor' ? 'Overview' : pageName.charAt(0).toUpperCase() + pageName.slice(1);

    return (
        <VendorGuard>
            <div className="min-h-screen bg-secondary/5 flex text-foreground">
                <DashboardSidebar />

                <div className="flex-1 md:ml-64 flex flex-col min-h-screen overflow-x-hidden">
                    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 sticky top-0 z-10 w-full">
                        <h1 className="font-bold uppercase tracking-tight text-sm md:text-base">
                            {formattedPageName}
                        </h1>

                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/vendor/notifications" className="relative text-secondary hover:text-primary transition-colors block">
                                <Bell className="w-5 h-5" />
                                {mounted && unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] text-background">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                            <div className="h-8 w-8 bg-secondary/20 rounded-full flex items-center justify-center text-xs font-bold uppercase">
                                VS
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                        {children}
                    </main>
                </div>
            </div>
        </VendorGuard>
    );
}
