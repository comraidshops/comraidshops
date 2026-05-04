'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, User, ShieldCheck, Globe } from 'lucide-react';
import { investorLogin, safeFetch } from '@/lib/fetchers';
import { API_BASE_URL } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';

function GoogleLoginButton({ text = "Sign in with Google" }: { text?: string }) {
    const handleGoogleLogin = () => {
        const clientID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const redirectURI = `${window.location.origin}/auth/callback`;
        const scope = "profile email";
        const responseType = "code";
        const state = "investor";
        
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
        
        window.location.href = googleAuthUrl;
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            type="button"
            className="w-full bg-white/5 border border-white/10 py-4 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-white/10 hover:border-white/20 transition-all group"
        >
            <div className="relative w-5 h-5 grayscale group-hover:grayscale-0 transition-all">
                <Image 
                    src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" 
                    alt="Google" 
                    fill 
                    className="object-contain"
                />
            </div>
            <span className="text-white/70 group-hover:text-white transition-colors">{text}</span>
        </motion.button>
    );
}

function LoginForm() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        <form onSubmit={handleLogin} className="space-y-6">
            {error && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-3"
                >
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    {error}
                </motion.div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2 px-1">
                        <User className="w-3 h-3" /> Investor Username
                    </label>
                    <input 
                        required
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="identity@comraid"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-white/5 focus:border-white/20 transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
                            <Lock className="w-3 h-3" /> Access Code
                        </label>
                        <button type="button" className="text-[9px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors">
                            Recover
                        </button>
                    </div>
                    <input 
                        required
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-white/5 focus:border-white/20 transition-all"
                    />
                </div>
            </div>

            <button 
                disabled={loading}
                type="submit"
                className="w-full bg-white text-black py-5 rounded-2xl text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>
                        Authorize Session
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.4em] text-white/20 bg-[#0A0A0A] px-4">
                    SECURE OAUTH
                </div>
            </div>

            <GoogleLoginButton />
        </form>
    );
}

export default function InvestorLoginPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col lg:flex-row selection:bg-white selection:text-black overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Left Hero Panel */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex lg:w-1/2 p-16 flex-col justify-between relative border-r border-white/5"
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="bg-white p-2 rounded-xl">
                            <Image src="/logo-white.png" alt="Comraid" width={32} height={32} className="invert" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-tighter text-white">ComraidShops</span>
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Capital Distribution</span>
                        </div>
                    </div>

                    <div className="space-y-8 max-w-lg">
                        <h1 className="text-6xl font-bold tracking-tighter leading-[0.95] text-white uppercase">
                            Equity <br />
                            <span className="text-white/20 italic font-serif lowercase tracking-normal">Transparency</span>
                        </h1>
                        <p className="text-lg text-white/40 font-medium leading-relaxed">
                            Access real-time portfolio performance, capital allocation transparency, and strategic platform roadmaps in our secure shareholder environment.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex flex-wrap gap-8">
                    {[
                        { label: 'Security', value: 'AES-256' },
                        { label: 'Status', value: 'Operational' },
                        { label: 'Network', value: 'Encrypted' }
                    ].map((stat, i) => (
                        <div key={i} className="space-y-1">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-white/20 block">{stat.label}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{stat.value}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Right Login Card */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
                        <div className="space-y-2 mb-10">
                            <div className="flex items-center gap-2 text-green-500 mb-4">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Verified Secure Node</span>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-white uppercase">Shareholder Login</h2>
                            <p className="text-white/30 text-xs uppercase tracking-widest font-bold">Authorized Personnel Only</p>
                        </div>

                        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div></div>}>
                            <LoginForm />
                        </Suspense>

                        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-white/20">
                                <Globe className="w-3 h-3" /> Global Platform Security
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-8 text-[9px] font-bold uppercase tracking-widest text-white/20">
                        <Link href="/" className="hover:text-white transition-colors">Return to platform</Link>
                        <span>/</span>
                        <Link href="/terms" className="hover:text-white transition-colors">Investor Legal</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
