'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, TrendingUp, PieChart, Milestone, 
    Bell, MessageSquare, LogOut, ArrowUpRight, 
    Calendar, Shield, Info, DollarSign, ExternalLink
} from 'lucide-react';
import { fetchInvestorDashboard } from '@/lib/fetchers';
import Image from 'next/image';

export default function InvestorDashboard() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const result = await fetchInvestorDashboard();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard.');
                // router.push('/investor-login');
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        router.push('/investor-login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Securing Session...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center">
                <Shield className="w-12 h-12 text-red-500 mb-4 opacity-20" />
                <h2 className="text-xl font-bold text-black mb-2">Access Restricted</h2>
                <p className="text-gray-500 text-sm max-w-xs mb-8">{error || 'Unable to verify investor status.'}</p>
                <button 
                    onClick={() => router.push('/investor-login')}
                    className="bg-black text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all"
                >
                    Return to Login
                </button>
            </div>
        );
    }

    const { profile, allocations, milestones, latest_updates, company_valuation, equity_value_indicator } = data;

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-black font-sans selection:bg-black selection:text-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-black p-2 rounded-lg">
                        <Image src="/logo-white.png" alt="ComraidShops" width={24} height={24} />
                    </div>
                    <div>
                        <span className="text-sm font-bold tracking-tight block">ComraidShops</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Shareholder Portal</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <a href="#" className="text-black">Overview</a>
                        <a href="#" className="hover:text-black transition-colors">Reports</a>
                        <a href="#" className="hover:text-black transition-colors">Company</a>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
                    >
                        <LogOut className="w-3 h-3" />
                        <span className="hidden sm:inline">Secure Logout</span>
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-12">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight">Welcome, {profile.user.first_name || profile.user.username}</h1>
                        <p className="text-gray-500 font-medium">Platform equity overview and strategic roadmap.</p>
                    </div>
                    <div className="bg-white border border-gray-200 px-6 py-4 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Investor Status</span>
                            <span className="text-xs font-bold uppercase text-green-600 tracking-wider">{profile.status_display}</span>
                        </div>
                    </div>
                </header>

                {/* Top Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Equity Stake', value: `${profile.equity_percentage}%`, icon: PieChart, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Total Investment', value: `$${parseFloat(profile.total_investment).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Indicative Value', value: `$${parseFloat(equity_value_indicator).toLocaleString()}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Vesting Start', value: profile.investment_date, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
                    ].map((metric, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className={`${metric.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                                <metric.icon className={`w-5 h-5 ${metric.color}`} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">{metric.label}</span>
                            <span className="text-2xl font-bold tracking-tight">{metric.value}</span>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Capital Transparency */}
                    <section className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-gray-400" />
                                Capital Allocation Transparency
                            </h2>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-8">
                            <div className="flex flex-wrap gap-4">
                                {allocations.map((alloc: any, i: number) => (
                                    <div key={i} className="flex-1 min-w-[140px] space-y-2">
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                            <span className="text-gray-400">{alloc.category_display}</span>
                                            <span>{alloc.allocation_percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-black rounded-full" 
                                                style={{ width: `${alloc.allocation_percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Allocation Logs</h3>
                                <div className="space-y-6">
                                    {allocations.map((alloc: any, i: number) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 flex-shrink-0"></div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest block">{alloc.category_display}</span>
                                                <p className="text-sm text-gray-500 leading-relaxed">{alloc.description_logs}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Milestone Tracker */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <Milestone className="w-5 h-5 text-gray-400" />
                            Roadmap Tracker
                        </h2>
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                            <div className="absolute top-8 bottom-8 left-[45px] w-0.5 bg-gray-50"></div>
                            <div className="space-y-10 relative">
                                {milestones.map((milestone: any, i: number) => (
                                    <div key={i} className="flex gap-6">
                                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center z-10 border-4 border-white ${
                                            milestone.status === 'completed' ? 'bg-green-500 text-white' : 
                                            milestone.status === 'ongoing' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            <div className="w-2 h-2 bg-current rounded-full"></div>
                                        </div>
                                        <div className="space-y-1 pt-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-tighter text-gray-300">{milestone.date}</span>
                                                <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                    milestone.status === 'completed' ? 'bg-green-50 text-green-600' : 
                                                    milestone.status === 'ongoing' ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'
                                                }`}>
                                                    {milestone.status_display}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-bold text-black">{milestone.title}</h3>
                                            <p className="text-[11px] text-gray-500 leading-normal">{milestone.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Company Value & Disclaimer */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-black text-white rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group">
                        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Current Valuation Snapshot</span>
                                <h2 className="text-4xl font-bold tracking-tight">${parseFloat(company_valuation || 0).toLocaleString()}</h2>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    Post-Seed Stage
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                                    <Shield className="w-4 h-4 text-blue-400" />
                                    Audited Q1 2026
                                </div>
                            </div>
                        </div>
                        <div className="mt-12 flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                                <span className="text-white block mb-1 uppercase tracking-widest">Financial Disclaimer</span>
                                This is informational only and does not represent guaranteed financial returns. Valuations are estimates based on latest funding rounds and internal metrics.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <Bell className="w-5 h-5 text-gray-400" />
                            Investor Updates Feed
                        </h2>
                        <div className="space-y-4">
                            {latest_updates.map((update: any, i: number) => (
                                <div key={i} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:border-black/10 transition-all group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-300">{new Date(update.created_at).toLocaleDateString()}</span>
                                        <span className="text-[8px] font-bold uppercase tracking-widest bg-gray-50 text-gray-400 px-2 py-1 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                                            {update.category}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold mb-2 group-hover:translate-x-1 transition-transform">{update.title}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{update.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Future Participation */}
                <section className="bg-white border border-gray-100 rounded-[40px] p-12 text-center space-y-8 shadow-sm">
                    <div className="max-w-2xl mx-auto space-y-4">
                        <div className="bg-gray-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-8 h-8 text-black" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Future Participation & Funding</h2>
                        <p className="text-gray-500 font-medium">We are preparing for our Series A round in Q4 2026. Stay ahead of the curve by indicating your interest or scheduling a strategic briefing with the founders.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="w-full sm:w-auto bg-black text-white px-10 py-5 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl shadow-black/10">
                            Contact Founder <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="w-full sm:w-auto bg-gray-50 text-black border border-gray-200 px-10 py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all">
                            Opt-in to Funding Alerts
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-12 px-6 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <div className="bg-black p-1.5 rounded-lg">
                            <Image src="/logo-white.png" alt="ComraidShops" width={16} height={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">© 2026 ComraidShops Platform Inc.</span>
                    </div>
                    <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <a href="#" className="hover:text-black transition-colors">Security Policy</a>
                        <a href="#" className="hover:text-black transition-colors">Privacy</a>
                        <a href="#" className="hover:text-black transition-colors">Investor Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
