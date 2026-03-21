'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Bell, Shield, CheckCircle, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

/* ─── helpers ─── */
type FeedbackState = { type: 'success' | 'error'; message: string } | null;

function SectionCard({ title, subtitle, icon: Icon, children }: {
    title: string; subtitle: string; icon: React.ElementType; children: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background border border-border"
        >
            <div className="flex items-start gap-4 p-8 border-b border-border">
                <div className="w-10 h-10 bg-secondary/5 border border-border flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-secondary/40" />
                </div>
                <div>
                    <h3 className="font-bold uppercase tracking-tight text-sm">{title}</h3>
                    <p className="text-[10px] text-secondary/50 uppercase tracking-widest font-bold mt-0.5">{subtitle}</p>
                </div>
            </div>
            <div className="p-8">{children}</div>
        </motion.div>
    );
}

function Feedback({ state }: { state: FeedbackState }) {
    if (!state) return null;
    const isSuccess = state.type === 'success';
    return (
        <AnimatePresence>
            <motion.div
                key={state.message}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-center gap-3 p-4 border text-xs font-bold uppercase tracking-wide ${
                    isSuccess ? 'border-green-500/30 bg-green-500/5 text-green-600' : 'border-red-500/30 bg-red-500/5 text-red-600'
                }`}
            >
                {isSuccess
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {state.message}
            </motion.div>
        </AnimatePresence>
    );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-border last:border-0">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em]">{label}</p>
                {hint && <p className="text-[9px] text-secondary/40 uppercase tracking-widest font-bold mt-1">{hint}</p>}
            </div>
            <div className="md:col-span-2">{children}</div>
        </div>
    );
}

function TextInput({ id, value, onChange, placeholder, type = 'text', disabled = false }: {
    id: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean;
}) {
    return (
        <input
            id={id}
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-secondary/5 border border-border px-4 py-3 text-xs font-bold uppercase tracking-widest placeholder:text-secondary/30 focus:outline-none focus:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        />
    );
}

function PasswordInput({ id, value, onChange, placeholder }: {
    id: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                id={id}
                type={show ? 'text' : 'password'}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-secondary/5 border border-border px-4 py-3 pr-12 text-xs font-bold tracking-widest placeholder:text-secondary/30 focus:outline-none focus:border-primary transition-colors"
            />
            <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-primary transition-colors"
            >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    );
}

function SaveButton({ loading, label = 'Save Changes' }: { loading: boolean; label?: string }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-background px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {label}
        </button>
    );
}

/* ─── Main Page ─── */
export default function SettingsPage() {
    const token = () => localStorage.getItem('access_token') ?? '';
    const authHeaders = (extra: Record<string, string> = {}) => ({
        Authorization: `Bearer ${token()}`,
        'Content-Type': 'application/json',
        ...extra,
    });

    /* ── Profile state ── */
    const [profile, setProfile] = useState({ username: '', email: '', first_name: '', last_name: '' });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileFeedback, setProfileFeedback] = useState<FeedbackState>(null);

    /* ── Password state ── */
    const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [pwFeedback, setPwFeedback] = useState<FeedbackState>(null);

    /* ── Notifications state ── */
    const [notifPrefs, setNotifPrefs] = useState({ order_updates: true, promotions: false, platform_news: true });
    const [notifFeedback, setNotifFeedback] = useState<FeedbackState>(null);

    /* fetch profile on mount */
    useEffect(() => {
        fetch(`${API_BASE_URL}/user/profile/`, { headers: authHeaders() })
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d) setProfile(d); });

        // Load notification prefs from localStorage (persisted client-side, could be extended to backend)
        try {
            const saved = JSON.parse(localStorage.getItem('notif_prefs') ?? '{}');
            setNotifPrefs(p => ({ ...p, ...saved }));
        } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Handlers ── */
    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileFeedback(null);
        try {
            const res = await fetch(`${API_BASE_URL}/user/profile/`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({
                    email: profile.email,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setProfile(data);
                setProfileFeedback({ type: 'success', message: 'Profile updated successfully.' });
            } else {
                const msg = Object.values(data).flat().join(' ') || 'Update failed.';
                setProfileFeedback({ type: 'error', message: msg });
            }
        } catch {
            setProfileFeedback({ type: 'error', message: 'Network error. Please try again.' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwFeedback(null);

        if (pwForm.next !== pwForm.confirm) {
            setPwFeedback({ type: 'error', message: 'New passwords do not match.' });
            return;
        }
        if (pwForm.next.length < 8) {
            setPwFeedback({ type: 'error', message: 'Password must be at least 8 characters.' });
            return;
        }

        setPwLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/user/change-password/`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ current_password: pwForm.current, new_password: pwForm.next }),
            });
            const data = await res.json();
            if (res.ok) {
                setPwFeedback({ type: 'success', message: 'Password changed successfully. Please log in again.' });
                setPwForm({ current: '', next: '', confirm: '' });
                // Token is now invalid — force re-login after short delay
                setTimeout(() => {
                    localStorage.clear();
                    window.location.href = '/auth/login';
                }, 2500);
            } else {
                setPwFeedback({ type: 'error', message: data.error || 'Password change failed.' });
            }
        } catch {
            setPwFeedback({ type: 'error', message: 'Network error. Please try again.' });
        } finally {
            setPwLoading(false);
        }
    };

    const handleNotifSave = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('notif_prefs', JSON.stringify(notifPrefs));
        setNotifFeedback({ type: 'success', message: 'Notification preferences saved.' });
        setTimeout(() => setNotifFeedback(null), 3000);
    };

    const toggleNotif = (key: keyof typeof notifPrefs) =>
        setNotifPrefs(p => ({ ...p, [key]: !p[key] }));

    /* ── Render ── */
    return (
        <div className="space-y-12">
            {/* Page header */}
            <div>
                <h2 className="text-3xl font-bold uppercase tracking-tighter">Settings</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-secondary/50 font-bold mt-1">
                    Manage your account preferences and security
                </p>
            </div>

            {/* ── Section 1: Identity / Profile ── */}
            <SectionCard title="Identity" subtitle="Your public profile and contact details" icon={User}>
                <form onSubmit={handleProfileSave} className="space-y-0">
                    <Feedback state={profileFeedback} />

                    <FieldRow label="Username" hint="Cannot be changed">
                        <TextInput id="username" value={profile.username} onChange={() => {}} disabled placeholder="username" />
                    </FieldRow>

                    <FieldRow label="Email Address" hint="Used for notifications and login">
                        <TextInput
                            id="email"
                            type="email"
                            value={profile.email}
                            onChange={v => setProfile(p => ({ ...p, email: v }))}
                            placeholder="you@example.com"
                        />
                    </FieldRow>

                    <FieldRow label="First Name">
                        <TextInput
                            id="first_name"
                            value={profile.first_name}
                            onChange={v => setProfile(p => ({ ...p, first_name: v }))}
                            placeholder="First name"
                        />
                    </FieldRow>

                    <FieldRow label="Last Name">
                        <TextInput
                            id="last_name"
                            value={profile.last_name}
                            onChange={v => setProfile(p => ({ ...p, last_name: v }))}
                            placeholder="Last name"
                        />
                    </FieldRow>

                    <div className="pt-6">
                        <SaveButton loading={profileLoading} />
                    </div>
                </form>
            </SectionCard>

            {/* ── Section 2: Security ── */}
            <SectionCard title="Security" subtitle="Update your password and protect your account" icon={Lock}>
                <form onSubmit={handlePasswordChange} className="space-y-0">
                    <Feedback state={pwFeedback} />

                    <FieldRow label="Current Password">
                        <PasswordInput
                            id="current_pw"
                            value={pwForm.current}
                            onChange={v => setPwForm(p => ({ ...p, current: v }))}
                            placeholder="Enter current password"
                        />
                    </FieldRow>

                    <FieldRow label="New Password" hint="Minimum 8 characters">
                        <PasswordInput
                            id="new_pw"
                            value={pwForm.next}
                            onChange={v => setPwForm(p => ({ ...p, next: v }))}
                            placeholder="Enter new password"
                        />
                        {/* Strength bar */}
                        {pwForm.next.length > 0 && (
                            <div className="mt-3 space-y-1">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map(level => {
                                        const strength = Math.min(
                                            Math.floor(pwForm.next.length / 3),
                                            4
                                        );
                                        return (
                                            <div
                                                key={level}
                                                className={`h-1 flex-1 transition-colors ${
                                                    level <= strength
                                                        ? strength <= 1 ? 'bg-red-500'
                                                        : strength <= 2 ? 'bg-amber-500'
                                                        : strength <= 3 ? 'bg-blue-500'
                                                        : 'bg-green-500'
                                                        : 'bg-secondary/10'
                                                }`}
                                            />
                                        );
                                    })}
                                </div>
                                <p className="text-[9px] uppercase tracking-widest font-black text-secondary/40">
                                    {pwForm.next.length < 4 ? 'Too weak' : pwForm.next.length < 7 ? 'Moderate' : pwForm.next.length < 10 ? 'Strong' : 'Very strong'}
                                </p>
                            </div>
                        )}
                    </FieldRow>

                    <FieldRow label="Confirm Password">
                        <PasswordInput
                            id="confirm_pw"
                            value={pwForm.confirm}
                            onChange={v => setPwForm(p => ({ ...p, confirm: v }))}
                            placeholder="Repeat new password"
                        />
                        {pwForm.confirm.length > 0 && pwForm.next !== pwForm.confirm && (
                            <p className="text-[9px] text-red-500 uppercase tracking-widest font-black mt-2">Passwords do not match</p>
                        )}
                    </FieldRow>

                    <div className="pt-6">
                        <SaveButton loading={pwLoading} label="Update Password" />
                    </div>
                </form>
            </SectionCard>

            {/* ── Section 3: Notifications ── */}
            <SectionCard title="Notifications" subtitle="Choose what you hear about" icon={Bell}>
                <form onSubmit={handleNotifSave} className="space-y-0">
                    <Feedback state={notifFeedback} />

                    {([
                        { key: 'order_updates', label: 'Order Updates', desc: 'Status changes, shipping and delivery confirmations' },
                        { key: 'promotions',    label: 'Promotions',    desc: 'Exclusive drops, flash sales and campaign launches' },
                        { key: 'platform_news', label: 'Platform News', desc: 'New brands, feature releases and platform announcements' },
                    ] as const).map(item => (
                        <FieldRow key={item.key} label={item.label} hint={item.desc}>
                            <button
                                type="button"
                                onClick={() => toggleNotif(item.key)}
                                className={`relative w-12 h-6 flex-shrink-0 transition-colors focus:outline-none ${notifPrefs[item.key] ? 'bg-primary' : 'bg-secondary/20'}`}
                                role="switch"
                                aria-checked={notifPrefs[item.key]}
                            >
                                <motion.div
                                    layout
                                    className="absolute top-1 w-4 h-4 bg-background"
                                    animate={{ left: notifPrefs[item.key] ? '1.75rem' : '0.25rem' }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            </button>
                        </FieldRow>
                    ))}

                    <div className="pt-6">
                        <SaveButton loading={false} label="Save Preferences" />
                    </div>
                </form>
            </SectionCard>

            {/* ── Section 4: Account ── */}
            <SectionCard title="Account" subtitle="Access control and danger zone" icon={Shield}>
                <div className="space-y-6">
                    {/* Sessions info */}
                    <div className="flex items-center justify-between p-6 bg-secondary/5 border border-border">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-tight">Active Session</p>
                            <p className="text-[10px] text-secondary/50 uppercase tracking-widest font-bold mt-0.5">
                                You are currently logged in on this device.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-green-600">Active</span>
                        </div>
                    </div>

                    {/* Logout all */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-border">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-tight">Sign Out</p>
                            <p className="text-[10px] text-secondary/50 uppercase tracking-widest font-bold mt-0.5">
                                Securely end your current session.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => { localStorage.clear(); window.location.href = '/auth/login'; }}
                            className="text-[10px] font-black uppercase tracking-[0.15em] border border-border px-6 py-2.5 hover:border-primary hover:text-primary transition-all"
                        >
                            Sign Out
                        </button>
                    </div>

                    {/* Danger: account delete placeholder */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-tight text-red-500">Delete Account</p>
                            <p className="text-[10px] text-secondary/50 uppercase tracking-widest font-bold mt-0.5">
                                Permanently remove your account and all associated data. This cannot be undone.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => alert('To delete your account, please contact our support team.')}
                            className="text-[10px] font-black uppercase tracking-[0.15em] border border-red-500/30 text-red-500 px-6 py-2.5 hover:bg-red-500/5 transition-all flex-shrink-0"
                        >
                            Request Deletion
                        </button>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}
