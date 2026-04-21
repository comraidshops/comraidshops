'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useSlides, useProfile } from '@/lib/hooks';
import { Slide, UserProfile as User } from '@/lib/types';

interface HeroStatementProps {
    initialSlides?: Slide[];
    initialUser?: User;
}

export default function HeroStatement({ initialSlides, initialUser }: HeroStatementProps) {
    // We use useSWR for real-time updates and caching, but with SSR fallback
    const { data: slidesData } = useSlides({
        fallbackData: initialSlides as Slide[],
    });

    const { data: userData } = useProfile({
        fallbackData: initialUser as User,
    });
    
    // Cast to internal User interface if needed, or update internal User to match UserProfile
    const user = userData as User;

    const slides: Slide[] = Array.isArray(slidesData) ? slidesData : [];
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [slides]);

    // Role-based content
    const getRoleContent = () => {
        if (!user) return { greeting: null, buttonText: 'Shop Collections', href: '/shop' };
        if (user.is_superuser) return { greeting: 'HELLO MASTER', buttonText: 'Visit Admin Panel', href: '/dashboard/admin' };
        if (user.is_vendor) return { greeting: 'HELLO CURATOR', buttonText: 'Visit Dashboard', href: '/dashboard/vendor' };
        // "if its a member say HELLO CREATOR visit then SHOP COLLECTIONS"
        if (user.is_customer) return { greeting: 'HELLO CREATOR', buttonText: 'Shop Collections', href: '/shop' };
        return { greeting: null, buttonText: 'Shop Collections', href: '/shop' };
    };

    const { greeting, buttonText, href } = getRoleContent();

    const displaySlides = slides;

    return (
        <section className="relative h-[calc(100svh-4rem)] w-full overflow-hidden bg-black text-white flex flex-col items-center justify-center">
            {/* Background Media - Dynamic Slideshow */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                    {displaySlides.length > 0 && displaySlides[currentIndex]?.image && (
                        <motion.div
                            key={displaySlides[currentIndex].id || currentIndex}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 0.6, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="absolute inset-0"
                        >
                            {/* Blurred Background Layer */}
                            <div className="absolute inset-0 z-0 overflow-hidden">
                                <Image
                                    src={displaySlides[currentIndex].image}
                                    alt=""
                                    fill
                                    className="object-cover blur-[100px] scale-110 opacity-40"
                                    aria-hidden="true"
                                />
                            </div>

                            <Image
                                src={displaySlides[currentIndex].image}
                                alt="Brand Gallery"
                                fill
                                className="object-cover md:object-contain z-10"
                                priority={currentIndex === 0}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                    className="font-cormorant text-4xl sm:text-5xl md:text-7xl font-bold italic tracking-tight mb-12 drop-shadow-xl"
                >
                    Selected, <span className="italic opacity-80">Not Stocked.</span>
                </motion.h1>

                {/* The "Glow Bar" - Preserving architectural intent with enhanced subtlety */}
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 0.8, height: "100px" }}
                    transition={{ duration: 1.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-[1px] bg-gradient-to-b from-white via-white to-transparent shadow-[0_0_20px_rgba(255,255,255,0.4)] mb-12"
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
                    className="flex flex-col items-center"
                >
                    <AnimatePresence mode="wait">
                        {greeting && (
                            <motion.span
                                key={greeting}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.8 }}
                                className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block"
                            >
                                {greeting}
                            </motion.span>
                        )}
                    </AnimatePresence>

                    <Link 
                        href={href} 
                        className="group relative px-14 py-5 rounded-full overflow-hidden transition-all duration-700"
                    >
                        {/* Dark Glass Base */}
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-2xl border border-white/10 group-hover:border-white/40 transition-colors duration-500 rounded-full" />
                        
                        {/* Edge Glow */}
                        <div className="absolute inset-0 shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-shadow duration-700 rounded-full" />
                        
                        <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.5em] text-white/90 group-hover:text-white group-hover:tracking-[0.6em] transition-all duration-500 min-w-[120px] inline-block">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={buttonText}
                                    initial={{ opacity: 0, x: 5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -5 }}
                                    transition={{ duration: 0.5 }}
                                    className="block"
                                >
                                    {buttonText}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                        
                        {/* Inner Light Sweep */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
