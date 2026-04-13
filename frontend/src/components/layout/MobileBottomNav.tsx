'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, User, Bookmark, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { cartCount } = useCart();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            const token = localStorage.getItem('access_token');
            setIsAuthenticated(!!token);
        }, 0);
        return () => clearTimeout(timer);
    }, [pathname]);

    // Hide on vendor dashboard routes or auth routes
    const isVendorRoute = pathname?.startsWith('/dashboard/vendor') || pathname?.startsWith('/vendor');
    const isAuthRoute = pathname?.startsWith('/auth');
    const isOnDashboard = pathname?.startsWith('/dashboard/user');

    if (!mounted || isVendorRoute || isAuthRoute) return null;

    // On the dashboard: show Bag/Cart (no header cart there)
    // Outside the dashboard: show Orders (header already has cart)
    const bagOrOrdersItem = isOnDashboard
        ? { title: 'Bag', icon: ShoppingCart, href: '/cart', count: cartCount }
        : { title: 'Orders', icon: ClipboardList, href: isAuthenticated ? '/dashboard/user/orders' : '/auth/login' };

    const navItems = [
        { title: 'Home', icon: Home, href: '/' },
        { title: 'Shop', icon: ShoppingBag, href: '/shop' },
        { title: 'Archives', icon: Bookmark, href: isAuthenticated ? '/dashboard/user/saved-fits' : '/auth/login' },
        bagOrOrdersItem,
        { title: 'Account', icon: User, href: isAuthenticated ? '/dashboard/user' : '/auth/login' },
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="mx-4 mb-4 pointer-events-auto">
                    <nav
                        className="flex items-center justify-around rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
                        style={{
                            background: 'rgba(10,10,10,0.85)',
                            backdropFilter: 'blur(30px)',
                            WebkitBackdropFilter: 'blur(30px)',
                        }}
                    >
                        {navItems.map((item) => {
                            const isActive =
                                item.href === '/' 
                                    ? pathname === '/' 
                                    : pathname?.startsWith(item.href);

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="relative flex flex-col items-center justify-center flex-1 py-4 px-2 group"
                                >
                                    <div className="relative flex flex-col items-center gap-1">
                                        <div className="relative">
                                            <item.icon
                                                className={`w-5 h-5 transition-all duration-300 ${
                                                    isActive
                                                        ? 'text-primary scale-110'
                                                        : 'text-white/30 group-hover:text-white/60'
                                                }`}
                                                strokeWidth={isActive ? 2.5 : 2}
                                            />
                                            {item.count !== undefined && item.count > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-primary text-background text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full scale-100 ring-2 ring-black">
                                                    {item.count}
                                                </span>
                                            )}
                                        </div>
                                        <span
                                            className={`text-[8px] font-black uppercase tracking-[0.1em] transition-colors duration-300 ${
                                                isActive ? 'text-white' : 'text-white/20'
                                            }`}
                                        >
                                            {item.title}
                                        </span>
                                    </div>
                                    
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-active-glow"
                                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary blur-[2px]"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
