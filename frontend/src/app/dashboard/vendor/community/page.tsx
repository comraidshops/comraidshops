'use client';

import React, { useState, useEffect } from 'react';
import { Users, ExternalLink, User as UserIcon, Calendar, Search, Filter } from 'lucide-react';
import { fetchVendorCommunity } from '@/lib/api';
import { CommunityMember } from '@/types/user';
import { motion } from 'framer-motion';

export default function CommunityPage() {
    const [data, setData] = useState<{ brand_name: string; members_count: number; members: CommunityMember[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadCommunity = async () => {
            try {
                const result = await fetchVendorCommunity();
                setData(result);
            } catch (error) {
                console.error("Failed to load community data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadCommunity();
    }, []);

    const filteredMembers = data?.members.filter(m => 
        m.username.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl space-y-6 md:space-y-10 pb-12 md:pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter">Community Hub</h2>
                    <p className="text-[9px] md:text-[10px] text-secondary font-black uppercase tracking-[0.3em]">
                        {data?.brand_name} · <span className="text-primary">{data?.members_count} Members</span>
                    </p>
                </div>
                <div className="flex gap-2 md:gap-4">
                    <button className="border border-border px-4 md:px-6 py-2.5 md:py-3 text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:bg-secondary/5 transition-all flex items-center gap-2 flex-1 md:flex-initial justify-center active:scale-[0.98]">
                        Export List
                    </button>
                    <button className="bg-primary text-background px-4 md:px-6 py-2.5 md:py-3 text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 flex-1 md:flex-initial justify-center active:scale-[0.98]">
                        Forum <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    </button>
                </div>
            </div>

            {/* Stats / Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                <div className="p-5 md:p-8 border border-border bg-background space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-secondary/40">Total Reach</span>
                        <Users className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold tracking-tighter">{data?.members_count}</p>
                    <p className="text-[8px] text-green-500 font-bold uppercase tracking-widest">+12% this month</p>
                </div>
                <div className="p-5 md:p-8 border border-border bg-background space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-secondary/40">Engagement Rate</span>
                        <Filter className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold tracking-tighter">Alpha</p>
                    <p className="text-[8px] text-secondary/40 font-bold uppercase tracking-widest">Early access phase</p>
                </div>
                <div className="p-5 md:p-8 border border-border bg-background space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-secondary/40">Status</span>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold tracking-tighter uppercase">Active</p>
                    <p className="text-[8px] text-secondary/40 font-bold uppercase tracking-widest">Syncing in real-time</p>
                </div>
            </div>

            {/* Members List Section */}
            <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-secondary/60">Community Members</p>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary/40" />
                        <input 
                            type="text" 
                            placeholder="SEARCH BY USERNAME..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background border border-border pl-10 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest focus:border-primary outline-none transition-colors"
                        />
                    </div>
                </div>

                {filteredMembers.length === 0 ? (
                    <div className="border border-border bg-background p-20 flex flex-col items-center text-center space-y-4">
                        <Users className="w-12 h-12 text-secondary/10" />
                        <p className="text-sm font-bold uppercase tracking-widest text-secondary/40">No members found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                        {filteredMembers.map((member, i) => (
                            <motion.div 
                                key={member.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="p-4 md:p-6 border border-border bg-background hover:border-primary transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3 md:mb-4">
                                    <div className="w-9 h-9 md:w-10 md:h-10 bg-secondary/5 flex items-center justify-center rounded-none border border-border group-hover:bg-primary/5 transition-colors">
                                        <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-secondary/30 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-0.5 md:py-1 bg-secondary/5 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-secondary group-hover:text-primary transition-colors">
                                            <Calendar className="w-2 h-2 md:w-2.5 md:h-2.5" />
                                            {new Date(member.joined_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-0.5 md:space-y-1">
                                    <h4 className="text-[13px] md:text-sm font-bold uppercase tracking-tighter truncate">{member.username}</h4>
                                    <p className="text-[7px] md:text-[8px] text-secondary/40 font-black uppercase tracking-[0.2em]">Verified Curator</p>
                                </div>
                                <div className="mt-4 pt-4 md:mt-6 md:pt-6 border-t border-border flex items-center justify-between md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button className="text-[8px] font-black uppercase tracking-widest text-secondary hover:text-primary active:scale-95">View Bio</button>
                                    <button className="text-[8px] font-black uppercase tracking-widest text-primary active:scale-95">Message</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="pt-6 md:pt-10 border-t border-border mt-10 md:mt-20">
                <div className="p-5 md:p-10 bg-secondary/5 border border-dashed border-border flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                    <div className="space-y-1.5 md:space-y-2 text-center md:text-left">
                        <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Next Phase: Community Engagement Tooling</h4>
                        <p className="text-[10px] md:text-[11px] text-secondary uppercase tracking-tight leading-relaxed max-w-xl">
                            We are building tools to allow you to drop exclusive digital assets and early access keys 
                            directly to your community members.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 md:gap-2">
                        <span className="text-[7px] md:text-[8px] font-black tracking-widest uppercase px-2.5 md:px-3 py-1 bg-primary/10 text-primary">Beta Feature</span>
                        <p className="text-[8px] md:text-[9px] font-bold text-secondary italic">Coming Late Spring</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
