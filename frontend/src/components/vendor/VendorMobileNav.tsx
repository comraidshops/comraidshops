'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, Package, ShoppingCart, 
    DollarSign, Settings 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
    { title: 'Home', icon: LayoutDashboard, href: '/dashboard/vendor' },
    { title: 'Products', icon: Package, href: '/dashboard/vendor/products' },
    { title: 'Orders', icon: ShoppingCart, href: '/dashboard/vendor/orders' },
    { title: 'Earnings', icon: DollarSign, href: '/dashboard/vendor/earnings' },
    { title: 'Settings', icon: Settings, href: '/dashboard/vendor/settings' },
];

export default function VendorMobileNav() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

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
                        {NAV_ITEMS.map((item) => {
                            const isActive =
                                item.href === '/dashboard/vendor' 
                                    ? pathname === '/dashboard/vendor' 
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
                                            layoutId="vendor-nav-active-glow"
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
