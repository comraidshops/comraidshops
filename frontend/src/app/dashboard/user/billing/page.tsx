'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Trash2, ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { safeFetch } from '@/lib/api';

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
        try {
            const data = await safeFetch('/saved-cards/');
            if (data) setCards(data);
        } catch (err) {
            console.error("Failed to fetch cards:", err);
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
        try {
            await safeFetch(`/saved-cards/${id}/`, {
                method: 'DELETE'
            });
            fetchCards();
        } catch (err) {
            console.error("Failed to delete card:", err);
        }
    };

    if (loading) return null;

    return (
        <div className="space-y-16">
            <div className="border-b border-border pb-10">
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter font-cormorant italic">Payment Methods</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/50 mt-4 leading-relaxed">
                    Manage your saved credit cards for seamless checkouts.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <h3 className="text-xl font-cormorant italic tracking-tight font-bold">Saved Cards</h3>

                    {cards.length === 0 ? (
                        <div className="bg-background border border-border border-dashed p-12 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-4 bg-secondary/5 rounded-full">
                                <CreditCard className="w-6 h-6 text-secondary/30" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/50">No saved cards found in your wallet.</p>
                            <p className="text-[8px] uppercase tracking-widest text-secondary/30 max-w-[200px]">Save a card during your next checkout to enable one-click purchases.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cards.map((card) => (
                                <motion.div
                                    key={card.id}
                                    layout
                                    className="bg-background border-t-[0.5px] border-b-[0.5px] border-border py-10 px-8 flex items-center justify-between group hover:border-foreground/20 transition-all duration-500 relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-8 relative z-10">
                                        <div className="w-14 h-9 bg-foreground/5 flex items-center justify-center border border-foreground/10 group-hover:scale-110 transition-transform">
                                            <span className="text-[9px] font-black uppercase tracking-tighter">{card.card_type}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black tracking-[0.2em] group-hover:tracking-[0.25em] transition-all">**** **** **** {card.last4}</p>
                                            <p className="text-[9px] text-secondary/50 font-black uppercase tracking-[0.2em]">Expires {card.exp_month} // {card.exp_year}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteCard(card.id)}
                                        className="p-2 text-secondary/30 hover:text-red-500 transition-colors relative z-10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                                        <CreditCard className="w-24 h-24 rotate-12" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-foreground text-background p-12 space-y-10 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-[-20%] right-[-20%] w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>

                    <div className="space-y-8 relative z-10">
                        <div className="p-4 bg-white/10 w-fit border border-white/20">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-2xl font-black uppercase tracking-tighter font-cormorant italic">Secured Payments</h4>
                            <p className="text-[10px] font-black leading-relaxed text-secondary opacity-60 uppercase tracking-[0.3em]">
                                Your payment information is fully encrypted and securely tokenized.
                            </p>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-white/10 flex items-center gap-4 relative z-10">
                        <Lock className="w-3.5 h-3.5 text-secondary/40" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-secondary/40">PCI DSS COMPLIANT // SECURE CHECKOUT</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
