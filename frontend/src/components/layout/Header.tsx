'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, User, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { usePWA } from '@/context/PWAContext';
import Image from 'next/image';

export default function Header() {
    const { cartCount } = useCart();
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { isInstallable, installApp, isIOS, isStandalone, setManualShowPrompt } = usePWA();

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoggedIn(!!localStorage.getItem('access_token'));
        }, 0);
        return () => clearTimeout(timer);
    }, [pathname]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between relative">
                {/* Left: Mobile Menu Trigger */}
                <div className="lg:hidden cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </div>

                {/* Left: Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-8 text-sm font-bold tracking-widest uppercase">
                    <Link href="/articles" className="hover:text-primary transition-colors">Articles</Link>
                    <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
                    <Link href="/exhibitions" className="hover:text-primary transition-colors">Exhibitions</Link>
                    <Link href="/brands" className="hover:text-primary transition-colors">Brands</Link>
                </nav>

                {/* Center: Logo */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <Link href="/" className="text-xl font-bold tracking-tighter uppercase whitespace-nowrap flex items-center justify-center gap-2 lg:gap-3">
                        <div className="hidden lg:block relative h-7 w-28">
                            <Image 
                                src="/logo-white.png" 
                                alt="ComraidShops Logo" 
                                fill 
                                className="object-contain" 
                            />
                        </div>
                        <span className="hidden lg:block">ComraidShops</span>
                        <div className="block lg:hidden relative h-10 w-40">
                            <Image 
                                src="/logo-white.png" 
                                alt="ComraidShops Logo" 
                                fill 
                                className="object-contain" 
                            />
                        </div>
                    </Link>
                </div>

                {/* Right: Icons */}
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="hover:text-primary transition-colors hidden sm:block"
                    >
                        {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                    </button>

                    {((isInstallable || isIOS) && !isStandalone) && (
                        <button 
                            onClick={() => {
                                if (isInstallable && !isIOS) {
                                    installApp();
                                } else {
                                    setManualShowPrompt(true);
                                }
                            }}
                            className="hover:text-primary transition-colors flex items-center gap-2"
                            title="Install App"
                        >
                            <Download className="w-5 h-5" />
                            <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                                Install
                            </span>
                        </button>
                    )}
                    <Link href={isLoggedIn ? "/dashboard/user" : "/auth/login"} className="hover:text-primary transition-colors flex items-center gap-2">
                        <User className="w-5 h-5" />
                        <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">
                            {isLoggedIn ? 'Account' : 'Login'}
                        </span>
                    </Link>
                    <Link href="/cart" className="hover:text-primary transition-colors relative">
                        <ShoppingBag className="w-5 h-5" />
                        {mounted && cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] text-background">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Global Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-16 left-0 w-full bg-background border-b border-border p-4 shadow-lg lg:px-8 flex justify-center"
                    >
                        <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search our collection..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-secondary/5 border border-border p-4 text-sm font-bold tracking-widest uppercase focus:outline-none focus:border-primary transition-colors"
                            />
                            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary">
                                <Search className="w-5 h-5" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute top-16 left-0 w-full bg-background border-b border-border lg:hidden flex flex-col items-center py-12 gap-8 shadow-2xl"
                    >
                        <nav className="flex flex-col items-center gap-6 text-base font-bold tracking-widest uppercase">
                            <Link href="/articles" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Articles</Link>
                            <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Shop</Link>
                            <Link href="/exhibitions" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Exhibitions</Link>
                            <Link href="/brands" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors">Brands</Link>
                        </nav>
                        
                        <div className="w-full max-w-[200px] h-px bg-border"></div>

                        <div className="flex flex-col items-center gap-4">
                            {((isInstallable || isIOS) && !isStandalone) && (
                                <button 
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        if (isInstallable && !isIOS) {
                                            installApp();
                                        } else {
                                            setManualShowPrompt(true);
                                        }
                                    }}
                                    className="text-xs font-black uppercase tracking-[0.2em] text-primary border border-primary/20 px-8 py-3 w-full text-center"
                                >
                                    Install App
                                </button>
                            )}
                            {isLoggedIn ? (
                                <Link href="/dashboard/user" onClick={() => setIsMenuOpen(false)} className="text-xs font-black uppercase tracking-[0.2em] bg-primary text-background px-8 py-3">Dashboard</Link>
                            ) : (
                                <>
                                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="text-xs font-black uppercase tracking-[0.2em]">Sign In</Link>
                                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)} className="text-xs font-black uppercase tracking-[0.2em] bg-primary text-background px-8 py-3">Join Comraid</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
