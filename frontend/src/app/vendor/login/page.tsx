'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export default function VendorLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Get Tokens
            const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password }) // Using email as username
            });

            if (!loginRes.ok) {
                throw new Error('Invalid credentials. Please try again.');
            }

            const tokens = await loginRes.json();
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);

            // 2. Verify Vendor Status by trying to hit dashboard
            const dashboardRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/dashboard/`, {
                headers: { 'Authorization': `Bearer ${tokens.access}` }
            });

            if (dashboardRes.ok) {
                router.push('/dashboard/vendor');
            } else if (dashboardRes.status === 403) {
                localStorage.clear();
                setError('You do not have vendor access.');
            } else {
                localStorage.clear();
                setError('An error occurred. Please try again later.');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background font-sans selection:bg-primary selection:text-background">
            {/* Left Hero Panel */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hidden lg:flex lg:w-1/2 bg-primary text-background p-16 flex-col justify-between relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-black/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-12">
                        <div className="w-8 h-8 bg-background flex items-center justify-center">
                            <span className="text-primary font-bold text-lg">C</span>
                        </div>
                        <span className="text-lg font-bold tracking-tighter uppercase">ComraidShops</span>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-6xl font-bold tracking-tighter leading-[0.9] uppercase">
                            Empower Your <br />
                            <span className="text-secondary/50">Digital Brand.</span>
                        </h1>
                        <p className="text-lg text-secondary/80 max-w-md font-medium leading-relaxed">
                            Manage your brand. Track your orders. Grow your community. The ultimate control center for luxury creators.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40">
                    <span>© 2026 COMRAIDSHOPS</span>
                    <span>/</span>
                    <span>PRIVACY POLICY</span>
                    <span>/</span>
                    <span>TERMS</span>
                </div>
            </motion.div>

            {/* Right Login Card */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="w-full max-w-md space-y-12"
                >
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter uppercase">Portal Access</h2>
                        <p className="text-secondary text-xs uppercase tracking-widest font-bold">Enter your credentials to manage your brand.</p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Email Address
                                </label>
                                <input 
                                    required
                                    type="text" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="vendor@comraid.luxury"
                                    className="w-full bg-secondary/5 border border-border p-4 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> Secure Password
                                </label>
                                <input 
                                    required
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-secondary/5 border border-border p-4 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30"
                                />
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            type="submit"
                            className="w-full bg-primary text-background py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : (
                                <>
                                    Login to Vendor Dashboard
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-border flex flex-col gap-4">
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest text-center">
                            Difficulty accessing your account?
                        </p>
                        <button className="text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors">
                            Contact Support System
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
