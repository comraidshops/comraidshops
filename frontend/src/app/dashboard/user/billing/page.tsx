'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Trash2, ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';

interface SavedCard {
    id: number;
    last4: string;
    exp_month: string;
    exp_year: string;
    card_type: string;
    bank: string;
    is_default: boolean;
}

export default function BillingPage() {
    const [cards, setCards] = useState<SavedCard[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCards = async () => {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_BASE_URL}/saved-cards/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setCards(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        const load = async () => {
            await fetchCards();
        };
        load();
    }, []);

    const deleteCard = async (id: number) => {
        const token = localStorage.getItem('access_token');
        await fetch(`${API_BASE_URL}/saved-cards/${id}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchCards();
    };

    if (loading) return null;

    return (
        <div className="space-y-12">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold uppercase tracking-tighter">Vault & Billing</h2>
                <p className="text-secondary text-xs font-bold uppercase tracking-widest">Manage your secure payment methods and vault settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40">Registered Instruments</h3>
                    
                    {cards.length === 0 ? (
                        <div className="bg-background border border-border border-dashed p-12 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-4 bg-secondary/5 rounded-full">
                                <CreditCard className="w-6 h-6 text-secondary/30" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/50">No saved instruments found in your vault.</p>
                            <p className="text-[8px] uppercase tracking-widest text-secondary/30 max-w-[200px]">Save a card during your next checkout to enable one-click purchases.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cards.map((card) => (
                                <motion.div 
                                    key={card.id}
                                    layout
                                    className="bg-background border border-border p-6 flex items-center justify-between group hover:border-primary transition-all"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-8 bg-secondary/10 flex items-center justify-center rounded border border-border">
                                            <span className="text-[8px] font-black uppercase tracking-tighter">{card.card_type}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold tracking-widest">**** **** **** {card.last4}</p>
                                            <p className="text-[10px] text-secondary font-medium uppercase tracking-widest">Expires {card.exp_month}/{card.exp_year}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => deleteCard(card.id)}
                                        className="p-2 text-secondary/40 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-primary text-background p-10 space-y-8 relative overflow-hidden">
                    <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                    
                    <div className="space-y-6 relative z-10">
                        <div className="p-3 bg-white/10 w-fit rounded-full">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-bold uppercase tracking-tighter">Secured by Paystack</h4>
                            <p className="text-[10px] font-medium leading-relaxed text-secondary opacity-80 uppercase tracking-widest">
                                Your full card details never touch our servers. We use high-grade tokenization to ensure the absolute security of your financial data.
                            </p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 flex items-center gap-4 relative z-10">
                        <Lock className="w-3 h-3 text-secondary" />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-secondary">PCI DSS COMPLIANT SYSTEM</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
