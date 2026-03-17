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
    X,
    LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
    { title: 'Overview', icon: LayoutDashboard, href: '/dashboard/user' },
    { title: 'My Profile', icon: User, href: '/dashboard/user/profile' },
    { title: 'Addresses', icon: MapPin, href: '/dashboard/user/addresses' },
    { title: 'Billing', icon: CreditCard, href: '/dashboard/user/billing' },
    { title: 'Orders', icon: ShoppingBag, href: '/dashboard/user/orders' },
    { title: 'Settings', icon: Settings, href: '/dashboard/user/settings' },
];

export default function UserSidebar() {
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/auth/login';
    };

    return (
        <aside className="w-64 h-screen bg-background border-r border-border fixed left-0 top-0 z-20 hidden md:flex flex-col p-6">
            <div className="flex items-center gap-2 mb-12 px-2">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary flex items-center justify-center">
                        <span className="text-background font-bold text-xs">C</span>
                    </div>
                    <span className="text-sm font-bold uppercase tracking-tighter">My Account</span>
                </Link>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={`flex items-center gap-3 p-3 text-[10px] font-bold uppercase tracking-widest transition-all group ${
                                isActive 
                                ? 'bg-primary text-background' 
                                : 'text-secondary hover:bg-secondary/5'
                            }`}
                        >
                            <item.icon className={`w-4 h-4 ${isActive ? 'text-background' : 'text-secondary group-hover:text-primary transition-colors'}`} />
                            {item.title}
                            {isActive && (
                                <motion.div 
                                    layoutId="sidebar-indicator"
                                    className="ml-auto w-1 h-3 bg-secondary/50"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-6 border-t border-border">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all group"
                >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Secure Logout
                </button>
            </div>
        </aside>
    );
}
