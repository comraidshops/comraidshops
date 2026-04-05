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
        <aside className="w-64 bg-background border-r border-border fixed h-full hidden md:flex flex-col z-20">
            {/* Brand header */}
            <div className="h-16 flex items-center px-6 border-b border-border">
                <Link href="/" className="font-bold uppercase tracking-tighter text-lg hover:text-primary transition-colors">
                    ComraidShops
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4">
                {NAV_SECTIONS.map((section, sectionIndex) => (
                    <div key={section.label} className={sectionIndex > 0 ? 'mt-6 pt-6 border-t border-border/50' : ''}>
                        <p className="px-3 text-[9px] font-black text-secondary/40 uppercase tracking-[0.3em] mb-3">
                            {section.label}
                        </p>
                        <div className="space-y-0.5">
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
                                            group flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-200
                                            ${isActive 
                                                ? 'bg-primary/5 text-primary border-l-2 border-primary' 
                                                : 'text-secondary hover:bg-secondary/5 hover:text-foreground border-l-2 border-transparent'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-[16px] h-[16px] transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                                        <span className="tracking-wide">{item.name}</span>
                                        {isActive && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-secondary hover:text-red-500 w-full rounded-lg hover:bg-red-50 transition-all duration-200 group"
                >
                    <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
