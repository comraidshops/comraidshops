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
        <div className="space-y-12">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold uppercase tracking-tighter">Identity Settings</h2>
                <p className="text-secondary text-xs font-bold uppercase tracking-widest">Manage your personal information and security credentials.</p>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background border border-border p-8 max-w-2xl"
            >
                {message && (
                    <div className={`mb-8 p-4 text-[10px] font-bold uppercase tracking-widest border ${
                        message.type === 'success' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                    }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                                <User className="w-3 h-3" /> First Name
                            </label>
                            <input 
                                type="text"
                                value={user.first_name}
                                onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                                className="w-full bg-secondary/5 border border-border p-3 text-xs focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                                <User className="w-3 h-3" /> Last Name
                            </label>
                            <input 
                                type="text"
                                value={user.last_name}
                                onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                                className="w-full bg-secondary/5 border border-border p-3 text-xs focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                                <Mail className="w-3 h-3" /> Email Address
                            </label>
                            <input 
                                type="email"
                                value={user.email}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                                className="w-full bg-secondary/5 border border-border p-3 text-xs focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                                <Shield className="w-3 h-3" /> Username (Static)
                            </label>
                            <input 
                                disabled
                                type="text"
                                value={user.username}
                                className="w-full bg-secondary/5 border border-border p-3 text-xs opacity-50 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                        <button 
                            disabled={saving}
                            type="submit"
                            className="bg-primary text-background px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Sync Profile'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
