'use client';

import { useState } from 'react';
import { Heart, X, User } from 'lucide-react';
import { toggleArticleLike } from '@/lib/fetchers';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ArticleLikeButtonProps {
    slug: string;
    initialLikes: number;
    initialIsLiked: boolean;
}

export default function ArticleLikeButton({ slug, initialLikes, initialIsLiked }: ArticleLikeButtonProps) {
    const [likesCount, setLikesCount] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const router = useRouter();

    const handleToggleLike = async () => {
        // Immediate check for auth token to avoid network roundtrip delay for guest users
        const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('access_token');
        
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        // Optimistic update
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);

        try {
            const res = await toggleArticleLike(slug);
            if (res && res.likes_count !== undefined) {
                setLikesCount(res.likes_count);
                setIsLiked(res.is_liked);
            } else {
                throw new Error("Failed to like");
            }
        } catch (error) {
            // Revert optimistic update
            setIsLiked(isLiked);
            setLikesCount(prev => !isLiked ? prev - 1 : prev + 1);
            
            // Show custom sleek modal instead of native confirm
            setShowAuthModal(true);
        }
    };

    return (
        <>
            <button 
                onClick={handleToggleLike}
                className={`flex items-center gap-3 group transition-all duration-300 ${isLiked ? 'text-primary' : 'text-secondary/60 hover:text-foreground'}`}
                title={isLiked ? "Unlike article" : "Like article"}
            >
                <div className={`p-2.5 rounded-full border transition-all duration-300 ${isLiked ? 'bg-primary/5 border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'bg-secondary/5 border-border/20 group-hover:border-primary/50 group-hover:border-primary/30'} ${isAnimating ? 'scale-110' : 'scale-100'}`}>
                    <Heart 
                        size={16} 
                        strokeWidth={isLiked ? 2 : 1.5}
                        className={`transition-all duration-300 ${isLiked ? 'fill-primary text-primary drop-shadow-[0_0_5px_rgba(var(--primary),0.5)]' : 'fill-transparent'}`} 
                    />
                </div>
                <span className="text-[11px] uppercase tracking-[0.3em] font-bold">
                    {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
                </span>
            </button>

            {/* Premium Auth Modal */}
            <AnimatePresence>
                {showAuthModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
                        onClick={() => setShowAuthModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] pointer-events-none"></div>

                            <button 
                                onClick={() => setShowAuthModal(false)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                            >
                                <X size={20} strokeWidth={1.5} />
                            </button>

                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6 text-primary">
                                <Heart size={20} strokeWidth={1.5} className="fill-primary/20" />
                            </div>

                            <h3 className="text-xl md:text-2xl font-playfair italic font-bold uppercase tracking-widest text-white mb-2">
                                Join to Appreciate
                            </h3>
                            <p className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/50 mb-8 leading-relaxed max-w-xs mx-auto">
                                Create an account or sign in to like this editorial piece and join the Vanguard Community.
                            </p>

                            <div className="w-full flex flex-col gap-3">
                                <Link 
                                    href={`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                                    className="w-full group relative flex items-center justify-center gap-3 bg-white text-black py-4 px-6 overflow-hidden transition-all duration-500 hover:bg-gray-200"
                                >
                                    <User size={16} className="relative z-10" />
                                    <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.3em]">
                                        Sign In
                                    </span>
                                </Link>
                                
                                <button 
                                    onClick={() => setShowAuthModal(false)}
                                    className="w-full py-4 text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors mt-2"
                                >
                                    Continue Reading
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
