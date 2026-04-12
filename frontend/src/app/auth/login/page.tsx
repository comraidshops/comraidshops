'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { login } from '@/lib/api';
import Image from 'next/image';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        // Redirect if already logged in
        const token = localStorage.getItem('access_token');
        if (token) {
            router.replace('/dashboard/user');
            return;
        }

        if (searchParams?.get('registered')) {
            setSuccessMessage('Registration successful. Please login to continue.');
        }
    }, [searchParams, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const tokens: { access: string; refresh: string } = await login({ username: email, password });
            
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);

            // Redirect to dashboard or previous page
            const redirectTo = searchParams?.get('redirect') || '/dashboard/user';
            router.push(redirectTo);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {successMessage && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-50 border border-green-100 text-green-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    {successMessage}
                </motion.div>
            )}

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
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                            <Mail className="w-3 h-3" /> Email or Username
                        </label>
                        <input 
                            required
                            type="text" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full bg-secondary/5 border border-border p-4 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Secure Password
                            </label>
                            <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-secondary/60 hover:text-primary transition-colors">
                                Forgot?
                            </button>
                        </div>
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
                    className="w-full bg-primary text-background py-5 text-sm font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                    {loading ? 'Authenticating...' : (
                        <>
                            Enter Archive
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.4em] text-secondary/30 bg-background px-4">
                        OR SECURE OAUTH
                    </div>
                </div>

                <GoogleLoginButton />
            </form>
        </>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex bg-background font-sans selection:bg-primary selection:text-background">
            {/* Left Hero Panel */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hidden lg:flex lg:w-5/12 bg-primary text-background p-16 flex-col justify-between relative overflow-hidden"
            >
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-black/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 mb-12">
                        <Image src="/logo-white.png" alt="ComraidShops Logo" width={64} height={64} className="object-contain" />
                        <span className="text-lg font-bold tracking-tighter uppercase text-white">ComraidShops</span>
                    </Link>

                    <div className="space-y-6">
                        <h1 className="text-5xl font-bold tracking-tighter leading-[0.9] uppercase text-white">
                            Welcome <br />
                            <span className="text-secondary/50">Back.</span>
                        </h1>
                        <p className="text-base text-secondary/80 max-w-sm font-medium leading-relaxed">
                            Your luxury archive awaits. Sign in to access your curated selection, track unique pieces, and manage your bespoke preferences.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40">
                    <span>© 2026 COMRAIDSHOPS</span>
                    <span>/</span>
                    <span>PRIVACY</span>
                </div>
            </motion.div>

            {/* Right Login Card */}
            <div className="w-full lg:w-7/12 flex items-center justify-center p-8 md:p-16">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="w-full max-w-md space-y-12"
                >
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter uppercase text-primary">Member Login</h2>
                        <p className="text-secondary text-xs uppercase tracking-widest font-bold">Access your personal portal of curated excellence.</p>
                    </div>

                    <Suspense fallback={
                        <div className="p-12 flex justify-center">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent animate-spin"></div>
                        </div>
                    }>
                        <LoginForm />
                    </Suspense>

                    <div className="pt-8 border-t border-border flex flex-col items-center gap-4">
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                            New to ComraidShops?
                        </p>
                        <Link 
                            href="/auth/register"
                            className="text-[10px] font-extrabold uppercase tracking-widest text-primary hover:underline transition-all"
                        >
                            Request Access / Register
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
