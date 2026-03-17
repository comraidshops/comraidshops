'use client';

import React from 'react';
import { Users, ExternalLink } from 'lucide-react';

export default function CommunityPage() {
    return (
        <div className="max-w-4xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold uppercase tracking-tighter mb-2">Vendor Community</h2>
                    <p className="text-sm text-secondary uppercase tracking-widest">Connect with other luxury creators.</p>
                </div>
                <button className="bg-primary text-background px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2">
                    Access Private Forum <ExternalLink className="w-3 h-3" />
                </button>
            </div>

            <div className="border border-border bg-background p-12 flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-secondary/5 rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-secondary/30" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Community Access Pending</h3>
                    <p className="text-xs text-secondary leading-loose max-w-sm mx-auto uppercase tracking-tighter">
                        We are currently finalizing the exclusive vendor community infrastructure. 
                        Soon you will be able to share insights and collaborate with elite curators globally.
                    </p>
                </div>
                <div className="pt-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/5 border border-border text-[9px] font-bold uppercase tracking-widest text-secondary">
                        V-COMM STATUS: <span className="text-primary">ALPHA-TESTING</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: "Direct Messaging", desc: "Peer-to-peer secure communication." },
                    { title: "Collaborations", desc: "Find partners for cross-brand drops." },
                    { title: "Market Insights", desc: "Real-time luxury trend analytics." }
                ].map((feature, i) => (
                    <div key={i} className="p-6 border border-border bg-background group hover:border-primary transition-colors">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">{feature.title}</h4>
                        <p className="text-[11px] text-secondary uppercase tracking-tight leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
