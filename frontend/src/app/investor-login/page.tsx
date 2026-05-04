'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, User, ShieldCheck } from 'lucide-react';
import { investorLogin } from '@/lib/fetchers';
import Image from 'next/image';
import Link from 'next/link';

export default function InvestorLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If already logged in as investor, redirect to dashboard
        const token = localStorage.getItem('access_token');
        if (token) {
            // We could verify role here, but the API will handle it
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const tokens = await investorLogin({ username, password });
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);
            localStorage.setItem('user_role', 'investor');
            router.push('/investor/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 selection:bg-black selection:text-white">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="bg-black p-4 rounded-2xl mb-6 shadow-2xl shadow-black/10">
                        <Image src="/logo-white.png" alt="ComraidShops" width={48} height={48} className="object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-black mb-2">Shareholder Portal</h1>
                    <p className="text-gray-500 text-sm font-medium">Access your investment dashboard and reporting.</p>
                </div>

                {/* Login Card */}
                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 md:p-10">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 px-1">
                                    <User className="w-3 h-3" /> Investor Username
                                </label>
                                <input 
                                    required
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 px-1">
                                    <Lock className="w-3 h-3" /> Secure Access Code
                                </label>
                                <input 
                                    required
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                />
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            type="submit"
                            className="w-full bg-black text-white py-5 rounded-2xl text-sm font-bold uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-black/10 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Verify & Enter
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                            Secure End-to-End Encryption
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed max-w-[240px] mx-auto uppercase tracking-tighter">
                            Authorized personnel only. Access is monitored and logged for security purposes.
                        </p>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <Link href="/" className="hover:text-black transition-colors">Return Home</Link>
                    <span>/</span>
                    <Link href="/contact" className="hover:text-black transition-colors">Support</Link>
                </div>
            </motion.div>
        </div>
    );
}
