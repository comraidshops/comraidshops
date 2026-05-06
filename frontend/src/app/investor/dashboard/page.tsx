'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, TrendingUp, PieChart, Milestone, 
    Bell, MessageSquare, LogOut, ArrowUpRight, 
    Calendar, Shield, Info, DollarSign, ExternalLink,
    Search, Filter, Download, ChevronRight, Globe, Lock, Menu, X,
    Check
} from 'lucide-react';
import { 
    fetchInvestorDashboard, 
    fetchInvestorNotifications,
    markInvestorNotificationRead,
    markAllInvestorNotificationsRead
} from '@/lib/fetchers';
import { safeFetch } from '@/lib/api';
import Image from 'next/image';

export default function InvestorDashboard() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [dashboardResult, notificationsResult] = await Promise.all([
                    fetchInvestorDashboard(),
                    fetchInvestorNotifications()
                ]);
                setData(dashboardResult);
                setNotifications(notificationsResult || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard.');
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await markInvestorNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await markAllInvestorNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        router.push('/investor-login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-2 border-white/5 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-white rounded-full animate-spin"></div>
                    </div>
                    <div className="space-y-1 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">Encrypted Link</p>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Authorized Access Only</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-500/10 p-6 rounded-[40px] border border-red-500/20 mb-8">
                    <Shield className="w-12 h-12 text-red-500 opacity-50" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Security Alert</h2>
                <p className="text-white/40 text-sm max-w-xs mb-10 font-medium">{error || 'Session synchronization failed.'}</p>
                <button 
                    onClick={() => router.push('/investor-login')}
                    className="bg-white text-black px-12 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl shadow-white/10"
                >
                    Re-Authenticate
                </button>
            </div>
        );
    }

    const { profile, allocations, milestones, latest_updates, company_valuation, equity_value_indicator } = data;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black">
            {/* Ambient Lighting */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[150px]"></div>
            </div>

            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-xl">
                        <Image src="/logo-white.png" alt="Comraid" width={24} height={24} className="invert" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tighter block uppercase">ComraidShops</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Shareholder Portal</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-8">
                    <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-white/20">
                        <a href="#" className="text-white">Portfolio</a>
                        <a href="#" className="hover:text-white transition-colors">Governance</a>
                        <a href="#" className="hover:text-white transition-colors">Transparency</a>
                        <a href="#" className="hover:text-white transition-colors">Strategic</a>
                    </div>
                    <div className="hidden lg:block h-4 w-px bg-white/10"></div>
                    
                    {/* Notifications */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all relative"
                        >
                            <Bell className="w-4 h-4 text-white/60" />
                            {notifications.filter(n => !n.read).length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[8px] font-black flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                    {notifications.filter(n => !n.read).length}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <>
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setShowNotifications(false)}
                                        className="fixed inset-0 z-40"
                                    />
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-4 w-80 bg-[#0A0A0A] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden z-50 backdrop-blur-3xl"
                                    >
                                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Secure Alerts</span>
                                            {notifications.some(n => !n.read) && (
                                                <button 
                                                    onClick={markAllAsRead}
                                                    className="text-[8px] font-bold uppercase tracking-widest text-white/20 hover:text-white"
                                                >
                                                    Flush All
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                            {notifications.length > 0 ? notifications.map((n) => (
                                                <div 
                                                    key={n.id}
                                                    onClick={() => !n.read && markAsRead(n.id)}
                                                    className={`p-6 border-b border-white/5 last:border-0 transition-colors cursor-pointer group ${n.read ? 'opacity-40' : 'bg-white/[0.02]'}`}
                                                >
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
                                                            {new Date(n.created_at).toLocaleDateString()}
                                                        </span>
                                                        {!n.read && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />}
                                                    </div>
                                                    <p className="text-[11px] font-medium leading-relaxed text-white/80 group-hover:text-white transition-colors">
                                                        {n.message}
                                                    </p>
                                                </div>
                                            )) : (
                                                <div className="p-12 text-center flex flex-col items-center gap-4 opacity-10">
                                                    <Bell className="w-8 h-8" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">No Intelligence Updates</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 bg-white/[0.01] text-center">
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-white/10">End of Encrypted Stream</span>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="hidden lg:block h-4 w-px bg-white/10"></div>
                    
                    {/* Logout Button (Hidden on very small mobile, replaced by menu) */}
                    <button 
                        onClick={handleLogout}
                        className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400/60 hover:text-red-400 hover:bg-red-400/5 px-4 py-2 rounded-xl transition-all"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Terminate Session</span>
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 bg-white/5 rounded-xl border border-white/10"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-full left-0 w-full bg-[#0A0A0A] border-b border-white/5 p-8 flex flex-col gap-6 lg:hidden z-50 shadow-2xl backdrop-blur-3xl"
                        >
                            <div className="flex flex-col gap-4">
                                {['Portfolio', 'Governance', 'Transparency', 'Strategic'].map((item) => (
                                    <a key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white py-2 border-b border-white/[0.02]">
                                        {item}
                                    </a>
                                ))}
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-400/5 py-4 rounded-2xl"
                            >
                                <LogOut className="w-4 h-4" /> Terminate Session
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <main className="max-w-7xl mx-auto p-4 sm:p-8 lg:p-12 relative z-10 space-y-8 sm:space-y-12">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 sm:pb-12 border-b border-white/5">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="bg-white/5 text-white/40 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">
                                Institutional Access
                            </span>
                            <span className="text-white/20 text-[9px] font-bold uppercase tracking-widest hidden xs:inline">Node: 0xA12...9B2</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-bold tracking-tighter uppercase leading-none">
                            Welcome, <br className="sm:hidden" />
                            <span className="text-white/40">{profile.user.first_name || profile.user.username}</span>
                        </h1>
                        <p className="text-white/30 text-xs sm:text-sm font-medium tracking-wide">Real-time equity analytics & platform governance overview.</p>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-2">
                        <div className="bg-white/[0.02] border border-white/10 p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] flex items-center gap-4 sm:gap-6 shadow-2xl w-full sm:w-auto">
                            <div className="flex flex-col md:text-right">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 block">Connection Integrity</span>
                                <span className="text-xs font-bold uppercase text-green-500 tracking-wider">Secured (SSL)</span>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/10 flex-shrink-0">
                                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white/40" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Performance Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                        { label: 'Equity Ownership', value: `${profile.equity_percentage}%`, icon: PieChart, color: 'text-blue-400', glow: 'shadow-blue-500/10' },
                        { label: 'Committed Capital', value: `$${parseFloat(profile.total_investment).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
                        { label: 'Indicative Portfolio', value: `$${parseFloat(equity_value_indicator).toLocaleString()}`, icon: TrendingUp, color: 'text-purple-400', glow: 'shadow-purple-500/10' },
                        { label: 'Vesting Commencement', value: profile.investment_date, icon: Calendar, color: 'text-orange-400', glow: 'shadow-orange-500/10' },
                    ].map((metric, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className={`bg-white/[0.02] border border-white/5 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all group ${metric.glow}`}
                        >
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 bg-white/5 border border-white/10 group-hover:scale-110 transition-transform`}>
                                <metric.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${metric.color}`} />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 block">{metric.label}</span>
                                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{metric.value}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-8">
                    {/* Distribution Section */}
                    <section className="lg:col-span-2 space-y-6 sm:space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase flex items-center gap-3">
                                <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-white/20" />
                                Capital Distribution
                            </h2>
                            <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">
                                <Download className="w-3 h-3" /> <span className="hidden xs:inline">Audit Log</span>
                            </button>
                        </div>
                        
                        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 shadow-2xl space-y-10 sm:space-y-12">
                            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                                {allocations.map((alloc: any, i: number) => (
                                    <div key={i} className="space-y-3 sm:space-y-4">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block">{alloc.category_display}</span>
                                            <span className="text-xl sm:text-2xl font-bold text-white">{alloc.allocation_percentage}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${alloc.allocation_percentage}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                                            ></motion.div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 whitespace-nowrap">Strategic Logs</h3>
                                    <div className="w-full h-px bg-white/5"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {allocations.map((alloc: any, i: number) => (
                                        <div key={i} className="bg-white/[0.02] border border-white/5 p-5 sm:p-6 rounded-2xl sm:rounded-3xl hover:bg-white/[0.04] transition-all">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-2 sm:mb-3 underline decoration-white/10 underline-offset-4">{alloc.category_display}</span>
                                            <p className="text-[11px] sm:text-xs text-white/50 leading-relaxed font-medium">{alloc.description_logs}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Timeline Section */}
                    <section className="space-y-6 sm:space-y-8">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase flex items-center gap-3 px-2">
                            <Milestone className="w-5 h-5 sm:w-6 sm:h-6 text-white/20" />
                            Roadmap Node
                        </h2>
                        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-10 bottom-10 left-[43px] sm:left-[55px] w-px bg-white/5"></div>
                            <div className="space-y-10 sm:space-y-12 relative">
                                {milestones.map((milestone: any, i: number) => (
                                    <div key={i} className="flex gap-4 sm:gap-8 group">
                                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex-shrink-0 flex items-center justify-center z-10 border border-white/10 ${
                                            milestone.status === 'completed' ? 'bg-white text-black' : 
                                            milestone.status === 'ongoing' ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-[#0A0A0A] text-white/20'
                                        }`}>
                                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-current rounded-full"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter text-white/20">{milestone.date}</span>
                                                <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border w-fit ${
                                                    milestone.status === 'completed' ? 'border-white/20 text-white/60' : 
                                                    milestone.status === 'ongoing' ? 'border-blue-500/50 text-blue-400 bg-blue-500/5' : 'border-white/5 text-white/20'
                                                }`}>
                                                    {milestone.status_display}
                                                </span>
                                            </div>
                                            <h3 className="text-xs sm:text-sm font-bold text-white group-hover:translate-x-1 transition-transform">{milestone.title}</h3>
                                            <p className="text-[10px] sm:text-[11px] text-white/30 leading-relaxed font-medium">{milestone.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Strategic Row */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Valuation Card */}
                    <div className="bg-white text-black rounded-[32px] sm:rounded-[48px] p-8 sm:p-10 flex flex-col justify-between overflow-hidden relative group shadow-2xl min-h-[320px] sm:min-h-auto">
                        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-black/5 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-1000"></div>
                        <div className="relative z-10 space-y-6 sm:space-y-8">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Equity Valuation Model</span>
                                <h2 className="text-4xl sm:text-6xl font-bold tracking-tighter leading-none">${parseFloat(company_valuation || 0).toLocaleString()}</h2>
                            </div>
                            <div className="flex flex-wrap gap-3 sm:gap-4">
                                <div className="flex items-center gap-2 sm:gap-3 bg-black/5 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-black/5">
                                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Growth Node 4.0</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 bg-black/5 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-black/5">
                                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Verified Q1</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-10 sm:mt-16 flex items-start gap-4 p-5 sm:p-6 bg-black/5 rounded-2xl sm:rounded-3xl border border-black/5 backdrop-blur-sm">
                            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-black/40 flex-shrink-0 mt-1" />
                            <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] block mb-1 sm:mb-2">Legal Disclaimer</span>
                                <p className="text-[9px] text-black/50 leading-relaxed font-medium uppercase tracking-tighter">
                                    Informational asset display only. Does not represent guaranteed financial returns. Internal valuation model applied.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* News Feed */}
                    <div className="space-y-6 sm:space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase flex items-center gap-3">
                                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white/20" />
                                Intelligence Feed
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {latest_updates.map((update: any, i: number) => (
                                <div key={i} className="bg-white/[0.02] border border-white/5 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all group">
                                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-white/20">{new Date(update.created_at).toLocaleDateString()}</span>
                                        <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-widest bg-white/5 text-white/40 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/5 group-hover:bg-white group-hover:text-black transition-all">
                                            {update.category}
                                        </span>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 group-hover:translate-x-2 transition-transform text-white/90">{update.title}</h3>
                                    <p className="text-[11px] sm:text-xs text-white/30 leading-relaxed font-medium line-clamp-2">{update.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer Action */}
                <section className="bg-white/[0.02] border border-white/5 rounded-[32px] sm:rounded-[64px] p-10 sm:p-16 text-center space-y-8 sm:space-y-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                        <div className="bg-white/5 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[32px] flex items-center justify-center mx-auto mb-6 sm:mb-10 border border-white/10 group-hover:rotate-12 transition-transform">
                            <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-white/40" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase leading-none">Strategic Expansion Q4</h2>
                        <p className="text-white/30 text-sm sm:text-lg font-medium leading-relaxed tracking-wide">Indicate interest for upcoming Series A funding rounds or request a direct strategic session with the founding team.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 relative z-10">
                        <button className="w-full sm:w-auto bg-white text-black px-10 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                            Direct Contact <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="w-full sm:w-auto bg-transparent border border-white/10 text-white/40 px-10 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 hover:text-white transition-all">
                            Opt-in Notifications
                        </button>
                    </div>
                </section>
            </main>

            {/* Global Footer */}
            <footer className="border-t border-white/5 py-12 sm:py-16 px-6 sm:px-12 bg-transparent relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-1.5 rounded-lg">
                                <Image src="/logo-white.png" alt="Comraid" width={16} height={16} className="invert" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 text-center md:text-left">© 2026 COMRAIDSHOPS INC.</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-white/20 text-center">
                        <a href="#" className="hover:text-white transition-colors">Encryption Audit</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy Node</a>
                        <a href="#" className="hover:text-white transition-colors">Investor Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Security Response</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
