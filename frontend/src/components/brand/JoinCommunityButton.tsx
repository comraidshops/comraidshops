'use client';

import React, { useState } from 'react';
import { Users, Check, UserPlus } from 'lucide-react';
import { joinBrandCommunity, leaveBrandCommunity } from '@/lib/fetchers';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface JoinCommunityButtonProps {
    brandSlug: string;
    isInitialMember?: boolean;
    communityCount?: number;
}

export default function JoinCommunityButton({ brandSlug, isInitialMember = false, communityCount = 0 }: JoinCommunityButtonProps) {
    const [isMember, setIsMember] = useState(isInitialMember);
    const [count, setCount] = useState(communityCount);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleToggle = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push(`/auth/login?redirect=/brands/${brandSlug}`);
            return;
        }

        setIsLoading(true);
        // Optimistic update
        const previousState = isMember;
        const previousCount = count;
        
        setIsMember(!isMember);
        setCount(isMember ? count - 1 : count + 1);

        try {
            if (previousState) {
                await leaveBrandCommunity(brandSlug);
            } else {
                await joinBrandCommunity(brandSlug);
            }
        } catch (error) {
            console.error("Failed to toggle community membership:", error);
            // Revert on error
            setIsMember(previousState);
            setCount(previousCount);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`
                    group relative flex items-center gap-3 px-8 py-4 transition-all duration-500
                    overflow-hidden border
                    ${isMember 
                        ? 'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10' 
                        : 'bg-primary border-primary text-background hover:bg-primary/90 hover:scale-[1.02]'
                    }
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                `}
            >
                <div className="relative z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em]">
                    <AnimatePresence mode="wait">
                        {isMember ? (
                            <motion.div
                                key="joined"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="flex items-center gap-2"
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>Part of Community</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="join"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="flex items-center gap-2"
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Join Community</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                {/* Visual feedback for loading/interaction */}
                {isLoading && (
                    <motion.div 
                        className="absolute inset-0 bg-white/20"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                )}
            </button>

            {/* Subtle member count */}
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-secondary/60">
                <Users className="w-3 h-3" />
                <span>{count.toLocaleString()} Global Members</span>
            </div>
        </div>
    );
}
