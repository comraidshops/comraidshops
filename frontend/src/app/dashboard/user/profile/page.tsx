'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Shield, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';

export default function ProfilePage() {
    const [user, setUser] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_BASE_URL}/user/profile/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${API_BASE_URL}/user/profile/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email
                })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully.' });
            } else {
                setMessage({ type: 'error', text: 'Update failed. Please try again.' });
            }
        } catch {
            console.error("Profile update failed");
            setMessage({ type: 'error', text: 'An error occurred.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <div className="space-y-16 max-w-3xl">
            <div className="border-b border-border pb-10">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary/30 mb-2 block">Archive Sector 02</span>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Identity Manifest</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/50 mt-4 leading-relaxed">
                    Personalized protocol configuration. Maintain terminal accuracy for seamless delivery orchestration.
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background border border-border p-10 shadow-sm relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                    <User className="w-48 h-48 rotate-12" />
                </div>
                {message && (
                    <div className={`mb-8 p-4 text-[10px] font-bold uppercase tracking-widest border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/50 flex items-center gap-3">
                                <User className="w-3 h-3" /> First Name Asset
                            </label>
                            <input
                                type="text"
                                value={user.first_name}
                                onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                                className="w-full bg-secondary/5 border border-border p-4 text-[11px] font-bold uppercase tracking-tight focus:outline-none focus:border-foreground transition-all focus:bg-background"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/50 flex items-center gap-3">
                                <User className="w-3 h-3" /> Last Name Asset
                            </label>
                            <input
                                type="text"
                                value={user.last_name}
                                onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                                className="w-full bg-secondary/5 border border-border p-4 text-[11px] font-bold uppercase tracking-tight focus:outline-none focus:border-foreground transition-all focus:bg-background"
                            />
                        </div>

                        <div className="space-y-3 md:col-span-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/50 flex items-center gap-3">
                                <Mail className="w-3 h-3" /> Digital Coordinate (Email)
                            </label>
                            <input
                                type="email"
                                value={user.email}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                                className="w-full bg-secondary/5 border border-border p-4 text-[11px] font-bold uppercase tracking-tight focus:outline-none focus:border-foreground transition-all focus:bg-background"
                            />
                        </div>

                        <div className="space-y-3 md:col-span-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/30 flex items-center gap-3">
                                <Shield className="w-3 h-3" /> Terminal Identifier (Static)
                            </label>
                            <input
                                disabled
                                type="text"
                                value={user.username}
                                className="w-full bg-secondary/5 border border-border p-4 text-[11px] font-black uppercase tracking-tight opacity-30 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="pt-10 border-t border-foreground/5 flex justify-end">
                        <button
                            disabled={saving}
                            type="submit"
                            className="bg-foreground text-background px-12 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:translate-y-[-2px] transition-all flex items-center gap-3 disabled:opacity-50 shadow-xl"
                        >
                            <Save className="w-3.5 h-3.5" />
                            {saving ? 'Synchronizing...' : 'Update Manifest'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
