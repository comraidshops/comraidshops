'use client';

import { usePathname } from 'next/navigation';
import UserSidebar from '@/components/user/UserSidebar';
import UserGuard from '@/components/auth/UserGuard';
import { LogOut } from 'lucide-react';

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const parts = (pathname || '').split('/');
    const pageName = parts[parts.length - 1] === 'user' ? 'Account Overview' : parts[parts.length - 1];
    const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/auth/login';
    };

    return (
        <UserGuard>
            <div className="min-h-screen bg-background flex text-foreground selection:bg-foreground selection:text-background">
                <UserSidebar />

                <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
                    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 sticky top-0 z-30 w-full">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-secondary/50 leading-none mb-1">Navigation</span>
                            <h1 className="font-black uppercase tracking-tight text-[10px] md:text-xs">
                                {formattedPageName}
                            </h1>
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
        </UserGuard>
    );
}
