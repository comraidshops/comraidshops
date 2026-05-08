'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, Package, ShoppingCart, DollarSign, 
    CreditCard, Settings, Bell, BarChart2, LogOut, Users
} from 'lucide-react';

const NAV_SECTIONS = [
    {
        label: 'Main',
        items: [
            { name: 'Overview', href: '/dashboard/vendor', icon: LayoutDashboard },
            { name: 'Products', href: '/dashboard/vendor/products', icon: Package },
            { name: 'Orders', href: '/dashboard/vendor/orders', icon: ShoppingCart },
        ]
    },
    {
        label: 'Finance',
        items: [
            { name: 'Earnings', href: '/dashboard/vendor/earnings', icon: DollarSign },
            { name: 'Withdrawals', href: '/dashboard/vendor/withdrawals', icon: CreditCard },
        ]
    },
    {
        label: 'Engage',
        items: [
            { name: 'Community', href: '/dashboard/vendor/community', icon: Users },
            { name: 'Analytics', href: '/dashboard/vendor/analytics', icon: BarChart2 },
            { name: 'Notifications', href: '/dashboard/vendor/notifications', icon: Bell },
        ]
    },
    {
        label: 'Account',
        items: [
            { name: 'Settings', href: '/dashboard/vendor/settings', icon: Settings },
        ]
    }
];

export default function DashboardSidebar() {
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/auth/login';
    };

    return (
        <aside className="w-64 bg-background border-r border-white/5 fixed h-full hidden md:flex flex-col z-20 transition-all duration-500">
            {/* Brand header */}
            <div className="h-16 flex items-center px-8 border-b border-white/5">
                <Link href="/" className="font-black uppercase tracking-[-0.05em] text-xl hover:text-primary transition-all duration-300 group">
                    Comraid<span className="text-secondary/40 group-hover:text-primary/60 transition-colors">Shops</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-8 px-6 space-y-8 custom-scrollbar">
                {NAV_SECTIONS.map((section) => (
                    <div key={section.label}>
                        <p className="px-3 text-[9px] font-black text-secondary/30 uppercase tracking-[0.4em] mb-4">
                            {section.label}
                        </p>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.href === '/dashboard/vendor' 
                                    ? (pathname || '') === item.href 
                                    : (pathname || '').startsWith(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`
                                            group flex items-center gap-3.5 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-300
                                            ${isActive 
                                                ? 'text-primary' 
                                                : 'text-secondary/60 hover:text-primary active:scale-[0.98]'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            w-8 h-8 flex items-center justify-center transition-all duration-300 border
                                            ${isActive 
                                                ? 'bg-primary text-background border-primary shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                                                : 'bg-transparent border-transparent group-hover:border-white/10 group-hover:bg-white/5'
                                            }
                                        `}>
                                            <Icon className={`w-[14px] h-[14px] transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
                                        </div>
                                        <span className="transition-colors">{item.name}</span>
                                        {isActive && (
                                            <div className="ml-auto w-1 h-1 rounded-full bg-primary animate-pulse" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-6 border-t border-white/5">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3.5 px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-secondary/50 hover:text-red-500 w-full transition-all duration-300 group hover:bg-red-500/5 active:scale-95"
                >
                    <div className="w-8 h-8 flex items-center justify-center bg-transparent border border-transparent group-hover:border-red-500/20 group-hover:bg-red-500/5 transition-all">
                        <LogOut className="w-[14px] h-[14px] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
