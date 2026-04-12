'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleArticleLike } from '@/lib/fetchers';
import { useRouter } from 'next/navigation';

interface ArticleLikeButtonProps {
    slug: string;
    initialLikes: number;
    initialIsLiked: boolean;
}

export default function ArticleLikeButton({ slug, initialLikes, initialIsLiked }: ArticleLikeButtonProps) {
    const [likesCount, setLikesCount] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isAnimating, setIsAnimating] = useState(false);
    const router = useRouter();

    const handleToggleLike = async () => {
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
                // if it fails but didn't throw (e.g. 401 from safeFetch that returns null)
                throw new Error("Failed to like");
            }
        } catch (error) {
            // Revert optimistic update
            setIsLiked(isLiked);
            setLikesCount(prev => !isLiked ? prev - 1 : prev + 1);
            
            // Assume 401/403 or unauthenticated
            if (window.confirm("Please log in or create an account to like articles. Go to login?")) {
                router.push('/auth/login');
            }
        }
    };

    return (
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
    );
}
