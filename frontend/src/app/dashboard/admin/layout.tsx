'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    LayoutDashboard, Users, ShoppingBag, FileText, 
    BarChart3, LogOut, ShieldCheck, Tags,
    ChevronRight, ArrowLeft, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProfile } from '@/lib/api';
import Image from 'next/image';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            try {
                const profile = await fetchProfile();
                if (!profile || !profile.is_superuser) {
                    router.push('/');
                    return;
                }
                setIsAdmin(true);
            } catch {
                router.push('/auth/login');
            } finally {
                setLoading(false);
            }
        }
        checkAuth();

        // Close mobile menu on route change
        setIsMobileMenuOpen(false);
    }, [router, pathname]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (!isAdmin) return null;

    const navItems = [
        { name: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Users & Vendors', href: '/dashboard/admin/users', icon: Users },
        { name: 'Products', href: '/dashboard/admin/products', icon: ShoppingBag },
        { name: 'Categories', href: '/dashboard/admin/categories', icon: Tags },
        { name: 'Orders', href: '/dashboard/admin/orders', icon: FileText },
        { name: 'Editorial', href: '/dashboard/admin/editorial', icon: FileText },
        { name: 'Finance', href: '/dashboard/admin/finance', icon: BarChart3 },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-8 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <Image src="/logo-white.png" alt="Logo" width={32} height={32} className="object-contain" />
                    {(isSidebarOpen || isMobileMenuOpen) && (
                        <span className="text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap">Admin Portal</span>
                    )}
                </Link>
                {isMobileMenuOpen && (
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/40 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            <nav className="mt-8 px-4 space-y-2 flex-grow">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.name} 
                            href={item.href}
                            className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group ${
                                isActive 
                                ? 'bg-white/5 text-primary border border-white/10' 
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                            {(isSidebarOpen || isMobileMenuOpen) && (
                                <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
                            )}
                            {isActive && (isSidebarOpen || isMobileMenuOpen) && (
                                <motion.div 
                                    layoutId="active-pill"
                                    className="ml-auto w-1 h-4 bg-primary rounded-full shadow-[0_0_10px_#ccf381]"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 space-y-2 mb-8">
                <Link 
                    href="/"
                    className="flex items-center gap-4 px-4 py-4 text-white/40 hover:text-white rounded-xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {(isSidebarOpen || isMobileMenuOpen) && <span className="text-[10px] font-bold uppercase tracking-widest">Back to Site</span>}
                </Link>
                <button 
                    onClick={() => {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        router.push('/auth/login');
                    }}
                    className="w-full flex items-center gap-4 px-4 py-4 text-red-400/60 hover:text-red-400 rounded-xl transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    {(isSidebarOpen || isMobileMenuOpen) && <span className="text-[10px] font-bold uppercase tracking-widest">Sign Out</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white flex overflow-hidden">
            {/* Desktop Sidebar */}
            <aside 
                className={`hidden lg:block ${isSidebarOpen ? 'w-64' : 'w-20'} bg-black/40 backdrop-blur-3xl border-r border-white/5 transition-all duration-500 ease-in-out relative z-30`}
            >
                <SidebarContent />
                {/* Collapse Toggle */}
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-20 bg-primary text-black p-1 rounded-full cursor-pointer hover:scale-110 transition-transform"
                >
                    <ChevronRight className={`w-3 h-3 transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : ''}`} />
                </button>
            </aside>

            {/* Mobile Sidebar (Slide-over) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-80 bg-black border-r border-white/10 z-50 lg:hidden"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-grow h-screen overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(204,243,129,0.05),transparent_40%)] flex flex-col">
                <header className="h-16 flex items-center justify-between px-6 lg:px-12 border-b border-white/5 backdrop-blur-md sticky top-0 z-20 shrink-0">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-white/60 hover:text-white"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Verified Admin</span>
                    </div>
                    
                    <div className="lg:hidden">
                        <Image src="/logo-white.png" alt="Logo" width={24} height={24} className="object-contain" />
                    </div>
                </header>

                <div className="p-6 lg:p-12 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
