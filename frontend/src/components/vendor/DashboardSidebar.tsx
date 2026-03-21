'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, Package, ShoppingCart, DollarSign, 
    CreditCard, Settings, Bell, BarChart2, LogOut, Users
} from 'lucide-react';

const NAV_ITEMS = [
    { name: 'Overview', href: '/dashboard/vendor', icon: LayoutDashboard },
    { name: 'Products', href: '/dashboard/vendor/products', icon: Package },
    { name: 'Orders', href: '/dashboard/vendor/orders', icon: ShoppingCart },
    { name: 'Earnings', href: '/dashboard/vendor/earnings', icon: DollarSign },
    { name: 'Community', href: '/dashboard/vendor/community', icon: Users },
    { name: 'Withdrawals', href: '/dashboard/vendor/withdrawals', icon: CreditCard },
    { name: 'Settings', href: '/dashboard/vendor/settings', icon: Settings },
    { name: 'Notifications', href: '/dashboard/vendor/notifications', icon: Bell },
    { name: 'Analytics', href: '/dashboard/vendor/analytics', icon: BarChart2 },
];

export default function DashboardSidebar() {
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/auth/login';
    };

    return (
        <aside className="w-64 bg-background border-r border-border fixed h-full hidden md:flex flex-col z-20">
            <div className="h-16 flex items-center px-6 border-b border-border">
                <Link href="/" className="font-bold uppercase tracking-tighter text-lg">
                    ComraidShops
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                <p className="px-2 text-xs font-bold text-secondary uppercase tracking-widest mb-4 mt-2">Vendor Portal</p>
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    // Exact match for Overview, prefix match for others
                    const isActive = item.href === '/dashboard/vendor' 
                        ? (pathname || '') === item.href 
                        : (pathname || '').startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors
                                ${isActive ? 'bg-secondary/10 text-primary' : 'text-secondary hover:bg-secondary/5 hover:text-primary'}
                            `}
                        >
                            <Icon className="w-4 h-4" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-secondary hover:text-red-500 w-full rounded-md hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
