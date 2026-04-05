'use client';

import React, { useEffect, useState } from 'react';
import StatCard from '@/components/vendor/StatCard';
import { History, Landmark } from 'lucide-react';

interface Withdrawal {
    id: number;
    amount: string;
    status: 'pending' | 'approved' | 'paid' | 'rejected';
    created_at: string;
    bank_name: string;
    account_number: string;
    account_name: string;
}

interface VendorMetrics {
    vendor_balance: number;
    pending_payout: number;
}

export default function WithdrawalsPage() {
    const [history, setHistory] = useState<Withdrawal[]>([]);
    const [metrics, setMetrics] = useState<VendorMetrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        bank_name: '',
        account_number: '',
        account_name: '',
        email: '',
        phone_number: ''
    });

    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const metricsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/dashboard/`, { headers });
                if (metricsRes.ok) setMetrics(await metricsRes.json());

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/withdrawals/`, { headers });
                if (res.ok) setHistory(await res.json());
            } catch (e) { console.error(e); }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        const withdrawalAmount = parseFloat(formData.amount);
        if (withdrawalAmount <= 0) {
            setStatus({ type: 'error', message: 'Withdrawal amount must be greater than zero.' });
            setLoading(false);
            return;
        }
        if (metrics && withdrawalAmount > metrics.vendor_balance) {
            setStatus({ type: 'error', message: 'Insufficient cleared balance for this withdrawal amount.' });
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/withdrawals/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus({ type: 'success', message: 'Withdrawal request submitted successfully.' });
                setFormData({ amount: '', bank_name: '', account_number: '', account_name: '', email: '', phone_number: '' });
                const updated = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/withdrawals/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setHistory(await updated.json());
            } else {
                const err = await res.json();
                setStatus({ type: 'error', message: err.detail || 'Failed to submit request.' });
            }
        } catch {
            setStatus({ type: 'error', message: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (s: string) => {
        switch (s) {
            case 'paid': return 'bg-green-100 text-green-700';
            case 'approved': return 'bg-blue-100 text-blue-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-secondary/10 text-secondary';
        }
    };

    return (
        <div className="space-y-5 md:space-y-8 pb-8 md:pb-12">
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tighter">Withdrawals</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <StatCard 
                    title="Available for Payout" 
                    value={`₦${(metrics?.vendor_balance || 0).toLocaleString()}`} 
                    icon={<Landmark className="w-4 h-4" />} 
                    description="Cleared funds ready for withdrawal"
                />
                <StatCard 
                    title="Pending Settlement" 
                    value={`₦${(metrics?.pending_payout || 0).toLocaleString()}`} 
                    icon={<History className="w-4 h-4" />} 
                    description="Earnings waiting for order completion"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8">
                {/* Withdrawal Form */}
                <div className="bg-background border border-border p-5 md:p-8">
                    <div className="flex items-center gap-3 mb-6 md:mb-8">
                        <Landmark className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                        <h3 className="text-[11px] md:text-sm font-bold uppercase tracking-widest">Request Payout</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                        <div>
                            <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Amount (₦)</label>
                            <input 
                                type="number" 
                                required 
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Bank Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.bank_name}
                                    onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                                    className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                                    placeholder="Global Bank"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Account Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.account_name}
                                    onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                                    className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                                    placeholder="Full Name"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Email Address</label>
                                <input 
                                    type="email" 
                                    required 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                                    placeholder="vendor@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Phone Number</label>
                                <input 
                                    type="tel" 
                                    required 
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                                    className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                                    placeholder="+234..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Account Number</label>
                            <input 
                                type="text" 
                                required 
                                value={formData.account_number}
                                onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                                className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                                placeholder="XXXX-XXXX-XXXX"
                            />
                        </div>

                        {status.message && (
                            <div className={`p-3 md:p-4 text-[10px] md:text-xs font-bold uppercase tracking-widest ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {status.message}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primary text-background font-bold uppercase tracking-widest py-3.5 md:py-4 text-[10px] md:text-xs hover:bg-primary/90 transition-colors disabled:opacity-50 active:scale-[0.98]"
                        >
                            {loading ? 'Submitting...' : 'Request Withdrawal'}
                        </button>
                    </form>
                </div>

                {/* History */}
                <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3">
                        <History className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                        <h3 className="text-[11px] md:text-sm font-bold uppercase tracking-widest">Withdrawal History</h3>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block bg-background border border-border overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-secondary uppercase tracking-widest border-b border-border bg-secondary/5">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {history.map((h) => (
                                    <tr key={h.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(h.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right font-medium">₦{parseFloat(h.amount).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusStyle(h.status)}`}>
                                                {h.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {history.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-secondary">No withdrawal history.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-2.5">
                        {history.map((h) => (
                            <div key={h.id} className="bg-background border border-border p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold">₦{parseFloat(h.amount).toLocaleString()}</p>
                                    <p className="text-[10px] text-secondary mt-0.5">{new Date(h.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest ${getStatusStyle(h.status)}`}>
                                    {h.status}
                                </span>
                            </div>
                        ))}
                        {history.length === 0 && (
                            <div className="bg-background border border-border px-6 py-12 text-center text-secondary text-sm">
                                No withdrawal history.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
