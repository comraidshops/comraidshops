'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, ArrowUpRight, Check, X,
    RefreshCcw, Edit3, Wallet
} from 'lucide-react';
import { safeFetch } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';
import { formatCurrency } from '@/lib/format';
import { AdminModal, AdminInput } from '@/components/admin/AdminForms';

interface Withdrawal {
    id: number;
    vendor_name: string;
    amount: string;
    status: 'pending' | 'approved' | 'paid' | 'rejected';
    created_at: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    email: string;
    phone_number: string;
}

interface Earning {
    id: number;
    vendor_brand_name: string;
    gross_amount: string;
    commission_amount: string;
    net_amount: string;
    status: string;
    created_at: string;
}

interface Commission {
    id: number;
    rate: string;
    is_active: boolean;
    created_at: string;
}

interface FinancialStats {
    total_payouts: number;
    platform_commission: number;
}

export default function AdminFinance() {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [earnings, setEarnings] = useState<Earning[]>([]);
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [stats, setStats] = useState<FinancialStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const { notify } = useNotification();
    const [activeTab, setActiveTab] = useState<'withdrawals' | 'earnings'>('withdrawals');

    // Commission State
    const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
    const [newRate, setNewRate] = useState('');

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const endpoint = activeTab === 'withdrawals' ? '/admin-api/withdrawals/' : '/admin-api/earnings/';
                const data = await safeFetch(endpoint);
                if (activeTab === 'withdrawals') setWithdrawals(data);
                else setEarnings(data);
            } catch (error) {
                console.error(`Failed to fetch ${activeTab}:`, error);
            } finally {
                setLoading(false);
            }
        }

        async function fetchCommissions() {
            try {
                const data = await safeFetch('/admin-api/commissions/');
                setCommissions(data);
            } catch {
                // Ignore silent fetch errors
            }
        }

        async function fetchStats() {
            try {
                const data = await safeFetch('/admin-api/stats/');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch financial stats:", error);
            }
        }

        fetchData();
        fetchCommissions();
        fetchStats();
    }, [activeTab]);

    async function handleUpdateCommission(e: React.FormEvent) {
        e.preventDefault();
        setActionLoading(true);
        try {
            const updated = await safeFetch('/admin-api/commissions/', {
                method: 'POST',
                body: JSON.stringify({ rate: newRate, is_active: true })
            });
            setCommissions([updated, ...commissions]);
            setIsCommissionModalOpen(false);
            setNewRate('');
            notify('success', 'Commission Updated', 'New commission rate has been successfully activated.');
        } catch (error: unknown) {
            notify('error', 'Update Failed', (error as Error)?.message || "Failed to update commission rate");
        } finally {
            setActionLoading(false);
        }
    }

    async function processWithdrawal(id: number, status: 'approved' | 'paid' | 'rejected') {
        setActionLoading(true);
        try {
            await safeFetch(`/admin-api/withdrawals/${id}/process/`, {
                method: 'POST',
                body: JSON.stringify({ status })
            });
            setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status } : w));
            notify('success', 'Request Processed', `Withdrawal has been marked as ${status}.`);
        } catch (error: unknown) {
            notify('error', 'Process Failed', (error as Error)?.message || "Failed to process withdrawal");
        } finally {
            setActionLoading(false);
        }
    }

    const activeCommission = commissions.find(c => c.is_active)?.rate || '10.00';

    return (
        <div className="space-y-8 lg:space-y-12">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 lg:mb-4 block">Fiscal Ledger</span>
                    <h1 className="text-4xl lg:text-5xl font-playfair font-medium tracking-tight">Financial <span className="italic opacity-80">Flow.</span></h1>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => {
                            setNewRate(activeCommission);
                            setIsCommissionModalOpen(true);
                        }}
                        className="bg-white/[0.02] border border-white/5 backdrop-blur-xl px-6 lg:px-8 py-4 rounded-2xl flex items-center gap-6 group hover:border-primary/30 transition-all text-left"
                    >
                        <div>
                            <span className="block text-[8px] font-bold uppercase tracking-widest text-white/40 mb-1">Commission Rate</span>
                            <span className="text-xl lg:text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                                {activeCommission}%
                                <Edit3 className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                            </span>
                        </div>
                    </button>
                    <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl px-6 lg:px-8 py-4 rounded-2xl flex items-center gap-6">
                        <div>
                            <span className="block text-[8px] font-bold uppercase tracking-widest text-white/40 mb-1">Total Payouts</span>
                            <span className="text-xl lg:text-2xl font-bold tracking-tight">
                                {stats ? formatCurrency(stats.total_payouts) : '...'}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div>
                            <span className="block text-[8px] font-bold uppercase tracking-widest text-white/40 mb-1">Platform</span>
                            <span className="text-xl lg:text-2xl font-bold tracking-tight text-primary">
                                {stats ? formatCurrency(stats.platform_commission) : '...'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex gap-4 border-b border-white/5 pb-8 overflow-x-auto no-scrollbar">
                {[
                    { id: 'withdrawals', label: 'Payouts', icon: ArrowUpRight },
                    { id: 'earnings', label: 'Earnings', icon: TrendingUp },
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setActiveTab(f.id as 'withdrawals' | 'earnings')}
                        className={`flex items-center gap-3 lg:gap-4 text-[10px] font-black uppercase tracking-[0.2em] px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all shrink-0 ${
                            activeTab === f.id 
                            ? 'bg-primary text-black' 
                            : 'bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/5 border border-white/5'
                        }`}
                    >
                        <f.icon className="w-4 h-4" />
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                                {activeTab === 'withdrawals' ? 'Vendor / Account' : 'Vendor / Order'}
                            </th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Amount</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Date</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {activeTab === 'withdrawals' ? (
                                withdrawals.map((w, idx) => (
                                    <motion.tr 
                                        key={w.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div>
                                                <div className="text-sm font-bold tracking-tight mb-1">{w.account_name} (ID: {w.id})</div>
                                                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{w.bank_name} • {w.account_number}</div>
                                                <div className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">
                                                    {w.email || 'No Email'} • {w.phone_number || 'No Phone'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-lg">{formatCurrency(w.amount)}</td>
                                        <td className="px-8 py-6">
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                                w.status === 'paid' ? 'bg-primary/10 text-primary' : 
                                                w.status === 'pending' ? 'bg-orange-400/10 text-orange-400' :
                                                'bg-white/5 text-white/20'
                                            }`}>
                                                {w.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-bold text-white/40">{new Date(w.created_at).toLocaleDateString()}</td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {w.status === 'pending' && (
                                                    <>
                                                        <button 
                                                            onClick={() => processWithdrawal(w.id, 'approved')}
                                                            className="p-3 rounded-xl bg-primary text-black hover:scale-110 transition-transform"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => processWithdrawal(w.id, 'rejected')}
                                                            className="p-3 rounded-xl bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white transition-all"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {w.status === 'approved' && (
                                                    <button 
                                                        onClick={() => processWithdrawal(w.id, 'paid')}
                                                        className="px-6 py-3 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                                    >
                                                        Mark as Paid
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                earnings.map((e, idx) => (
                                    <motion.tr 
                                        key={e.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div>
                                                <div className="text-sm font-bold tracking-tight mb-1">Order #{e.id}</div>
                                                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Platform Commission</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-bold">{formatCurrency(e.net_amount)}</div>
                                            <div className="text-[8px] text-primary font-black uppercase tracking-widest">+{formatCurrency(e.commission_amount)} Fee</div>
                                        </td>
                                        <td className="px-8 py-6 text-[8px] font-black uppercase tracking-widest text-white/40">{e.status}</td>
                                        <td className="px-8 py-6 text-[10px] font-bold text-white/40">{new Date(e.created_at).toLocaleDateString()}</td>
                                        <td className="px-8 py-6">
                                            <button className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white border border-white/5 transition-all opacity-0 group-hover:opacity-100">
                                                <RefreshCcw className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                <AnimatePresence mode="popLayout">
                    {activeTab === 'withdrawals' ? (
                        withdrawals.map((w) => (
                            <motion.div
                                key={w.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-bold tracking-tight">{w.account_name}</h4>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{w.bank_name} • {w.account_number}</p>
                                        <p className="text-[9px] text-primary uppercase tracking-widest font-bold">{w.email || 'No Email'} • {w.phone_number || 'No Phone'}</p>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                        w.status === 'paid' ? 'bg-primary/10 text-primary' : 
                                        w.status === 'pending' ? 'bg-orange-400/10 text-orange-400' :
                                        'bg-white/5 text-white/20'
                                    }`}>
                                        {w.status}
                                    </span>
                                </div>
                                <div className="text-xl font-bold">{formatCurrency(w.amount)}</div>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <span className="text-[10px] text-white/20 font-bold">{new Date(w.created_at).toLocaleDateString()}</span>
                                    <div className="flex gap-2">
                                        {w.status === 'pending' && (
                                            <>
                                                <button onClick={() => processWithdrawal(w.id, 'approved')} className="p-3 rounded-xl bg-primary text-black"><Check className="w-4 h-4" /></button>
                                                <button onClick={() => processWithdrawal(w.id, 'rejected')} className="p-3 rounded-xl bg-red-400/10 text-red-400"><X className="w-4 h-4" /></button>
                                            </>
                                        )}
                                        {w.status === 'approved' && (
                                            <button onClick={() => processWithdrawal(w.id, 'paid')} className="px-4 py-2 rounded-xl bg-primary text-black text-[10px] font-black">Pay</button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        earnings.map((e) => (
                            <motion.div
                                key={e.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4"
                            >
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-bold tracking-tight">Order #{e.id}</h4>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">{e.status}</span>
                                </div>
                                <div>
                                    <div className="text-xl font-bold">{formatCurrency(e.net_amount)}</div>
                                    <div className="text-[8px] text-primary font-black uppercase tracking-widest">+{formatCurrency(e.commission_amount)} Commission</div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <span className="text-[10px] text-white/20 font-bold">{new Date(e.created_at).toLocaleDateString()}</span>
                                    <button className="p-3 rounded-xl bg-white/5 text-white/40"><RefreshCcw className="w-4 h-4" /></button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Commission Management Modal */}
            <AdminModal 
                isOpen={isCommissionModalOpen} 
                onClose={() => setIsCommissionModalOpen(false)} 
                title="Global Revenue Adjustment"
                loading={actionLoading}
            >
                <form onSubmit={handleUpdateCommission} className="space-y-8">
                    <p className="text-white/40 text-[11px] font-bold leading-relaxed uppercase tracking-widest">
                        Adjust the platform&apos;s standard commission percentage. New rate will apply to all future transactions immediately.
                    </p>
                    <AdminInput 
                        label="Platform Fee (%)" 
                        type="number"
                        step="0.01"
                        value={newRate} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRate(e.target.value)}
                    />
                    <button 
                        type="submit"
                        className="w-full bg-primary text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all"
                    >
                        Apply Adjustment
                    </button>
                </form>
            </AdminModal>
            {((activeTab === 'withdrawals' && withdrawals.length === 0) || (activeTab === 'earnings' && earnings.length === 0)) && !loading && (
                <div className="p-24 text-center">
                    <Wallet className="w-12 h-12 text-white/5 mx-auto mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Financial history is empty</p>
                </div>
            )}
        </div>
    );
}
