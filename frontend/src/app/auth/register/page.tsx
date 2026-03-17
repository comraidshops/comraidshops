'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })
            });

            if (res.ok) {
                router.push('/auth/login?registered=true');
            } else {
                const data = await res.json();
                setError(Object.values(data).flat().join(' ') || 'Registration failed.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
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
                className="hidden lg:flex lg:w-5/12 bg-primary text-background p-16 flex-col justify-between relative overflow-hidden"
            >
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-black/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 mb-12">
                        <div className="w-8 h-8 bg-background flex items-center justify-center">
                            <span className="text-primary font-bold text-lg">C</span>
                        </div>
                        <span className="text-lg font-bold tracking-tighter uppercase text-white">ComraidShops</span>
                    </Link>

                    <div className="space-y-6">
                        <h1 className="text-5xl font-bold tracking-tighter leading-[0.9] uppercase text-white">
                            Join the <br />
                            <span className="text-secondary/50">Inner Circle.</span>
                        </h1>
                        <p className="text-base text-secondary/80 max-w-sm font-medium leading-relaxed">
                            A curated experience for the digital avant-garde. Gain access to exclusive releases, manage your luxury archive, and connect with visionary brands.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40">
                    <span>© 2026 COMRAIDSHOPS</span>
                    <span>/</span>
                    <span>PRIVACY</span>
                </div>
            </motion.div>

            {/* Right Register Card */}
            <div className="w-full lg:w-7/12 flex items-center justify-center p-8 md:p-16">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="w-full max-w-md space-y-12"
                >
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter uppercase text-primary">Create Account</h2>
                        <p className="text-secondary text-xs uppercase tracking-widest font-bold">Embark on your journey into curated luxury.</p>
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

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                                    <User className="w-3 h-3" /> Preferred Username
                                </label>
                                <input 
                                    name="username"
                                    required
                                    type="text" 
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="e.g. curator_of_style"
                                    className="w-full bg-secondary/5 border border-border p-4 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Email Address
                                </label>
                                <input 
                                    name="email"
                                    required
                                    type="email" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="curator@luxury.com"
                                    className="w-full bg-secondary/5 border border-border p-4 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30"
                                />
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> Secure Password
                                </label>
                                <div className="relative">
                                    <input 
                                        name="password"
                                        required
                                        type={showPassword ? "text" : "password"} 
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-secondary/5 border border-border p-4 pr-12 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> Confirm Password
                                </label>
                                <input 
                                    name="confirmPassword"
                                    required
                                    type="password" 
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
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
                            {loading ? 'Processing...' : (
                                <>
                                    Establish Account
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-border flex flex-col items-center gap-4">
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
                            Already part of the inner circle?
                        </p>
                        <Link 
                            href="/auth/login"
                            className="text-[10px] font-extrabold uppercase tracking-widest text-primary hover:underline transition-all"
                        >
                            Sign In to your Archive
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
