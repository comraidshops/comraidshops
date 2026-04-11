'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    User,
    MapPin,
    CreditCard,
    ShoppingBag,
    Settings,
    LogOut,
    LayoutDashboard,
    Bookmark
} from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
    { title: 'Overview', icon: LayoutDashboard, href: '/dashboard/user' },
    { title: 'Account Details', icon: User, href: '/dashboard/user/profile' },
    { title: 'Address Book', icon: MapPin, href: '/dashboard/user/addresses' },
    { title: 'Payment Methods', icon: CreditCard, href: '/dashboard/user/billing' },
    { title: 'Order History', icon: ShoppingBag, href: '/dashboard/user/orders' },
    { title: 'Saved Items', icon: Bookmark, href: '/dashboard/user/saved-fits' },
    { title: 'Preferences', icon: Settings, href: '/dashboard/user/settings' },
];

export default function UserSidebar() {
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/auth/login';
    };

    return (
        <aside className="w-64 h-screen bg-background border-r border-border fixed left-0 top-0 z-20 hidden md:flex flex-col p-8 select-none">
            <div className="flex flex-col gap-1 mb-16">
                <Link href="/" className="group flex items-center gap-3">
                    <div className="w-8 h-8 bg-foreground flex items-center justify-center transition-transform group-hover:rotate-12">
                        <span className="text-background font-black text-sm tracking-tighter">C.</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] leading-none">Management</span>
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-secondary/60">Dashboard</span>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                    const isActive = (pathname || '') === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between p-3.5 text-[9px] font-black uppercase tracking-[0.2em] transition-all group relative ${isActive
                                    ? 'bg-foreground text-background'
                                    : 'text-secondary/80 hover:bg-secondary/5 hover:text-foreground'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-background' : 'group-hover:text-foreground transition-colors'}`} />
                                <span>{item.title}</span>
                            </div>
                            {isActive ? (
                                <motion.div
                                    layoutId="sidebar-indicator"
                                    className="w-1 h-3 bg-background"
                                />
                            ) : (
                                <div className="w-0.5 h-2 bg-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-8 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-3.5 text-[9px] font-black uppercase tracking-[0.2em] text-secondary/60 hover:text-red-500 hover:bg-red-500/5 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <LogOut className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                        <span>Sign Out</span>
                    </div>
                </button>
                <div className="mt-4 px-3.5">
                    <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-secondary/30">System v0.4.2</p>
                </div>
            </div>
        </aside>
    );
}

