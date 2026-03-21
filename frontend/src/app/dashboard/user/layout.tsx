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
            <div className="min-h-screen bg-secondary/5 flex text-foreground">
                <UserSidebar />

                <div className="flex-1 md:ml-64 flex flex-col min-h-screen overflow-x-hidden">
                    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 sticky top-0 z-10 w-full">
                        <h1 className="font-bold uppercase tracking-tight text-xs md:text-sm">
                            {formattedPageName}
                        </h1>

                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handleLogout}
                                className="md:hidden flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500 mr-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                            <div className="h-7 w-7 bg-primary text-background flex items-center justify-center text-[10px] font-bold uppercase">
                                US
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto w-full">
                        {children}
                    </main>
                </div>
            </div>
        </UserGuard>
    );
}
