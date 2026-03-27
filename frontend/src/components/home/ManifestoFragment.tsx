'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

export default function ManifestoFragment() {
    const containerRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [-120, 120]);
    const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);
    const blurAmount = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [10, 0, 0, 10]);

    const sentence1 = "We do not chase trends.";
    const sentence2 = "We hunt for conviction.";

    const wordVariants = {
        hidden: { 
            opacity: 0, 
            y: 40,
            filter: "blur(10px)",
            scale: 0.95
        },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            scale: 1,
            transition: {
                delay: i * 0.08,
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number], // Custom cubic-bezier for a "luxury" feel
            },
        }),
    };

    return (
        <section 
            ref={containerRef}
            className="py-72 md:py-96 px-6 bg-background flex items-center justify-center text-center relative overflow-hidden"
        >
            {/* Atmosphere Background - Premium Texture */}
            <motion.div 
                style={{ y, scale }}
                className="absolute inset-0 z-0 opacity-60 pointer-events-none"
            >
                <Image
                    src="/images/manifesto_bg.png" 
                    alt="Atmospheric Background"
                    fill
                    className="object-cover grayscale brightness-[0.25]"
                    priority
                />
            </motion.div>

            {/* Premium Overlays */}
            <div className="absolute inset-0 z-[1] opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-soft-light" />
            <div className="absolute inset-0 z-[2] bg-radial-gradient from-transparent via-background/40 to-background" />
            <div className="absolute inset-0 z-[3] bg-gradient-to-b from-background via-transparent to-background" />

            <motion.div 
                style={{ opacity, filter: `blur(${blurAmount}px)` }}
                className="max-w-5xl relative z-10"
            >
                <div className="space-y-12">
                    <motion.div
                        initial={{ opacity: 0, letterSpacing: "1em" }}
                        whileInView={{ opacity: 0.4, letterSpacing: "0.6em" }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="text-[10px] md:text-[12px] font-black uppercase text-primary block mb-12"
                    >
                        Manifesto No. 01 / Perception
                    </motion.div>
                    
                    <h2 className="text-4xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight leading-[0.85] flex flex-wrap justify-center gap-x-6 md:gap-x-10 mb-20 px-4">
                        {sentence1.split(" ").map((word, i) => (
                            <motion.span
                                key={i}
                                custom={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                variants={wordVariants}
                                className="inline-block"
                            >
                                {word}
                            </motion.span>
                        ))}
                        
                        <div className="w-full h-4 md:h-12" /> {/* Visual spacing */}
                        
                        {sentence2.split(" ").map((word, i) => (
                            <motion.span
                                key={i}
                                custom={i + 6}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                variants={wordVariants}
                                className="inline-block text-foreground/40"
                            >
                                {word}
                            </motion.span>
                        ))}
                    </h2>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
                        className="flex flex-col items-center"
                    >
                        <div className="h-px w-24 bg-foreground/10 mb-16" />
                        
                        <p className="text-[13px] md:text-[15px] font-light uppercase tracking-[0.3em] text-secondary/60 leading-relaxed max-w-md">
                            ComraidShops exists for the <br />
                            <span className="text-foreground font-medium mt-4 block tracking-[0.4em]">creators by curators.</span>
                        </p>
                        
                        <div className="mt-16 flex items-center gap-4 text-[9px] uppercase tracking-[0.5em] text-secondary/40">
                            <span>Longevity</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                            <span>Conviction</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                            <span>Curation</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Decorative Geometric Element */}
            <motion.div 
                initial={{ opacity: 0, scaleY: 0 }}
                whileInView={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: 2, duration: 2 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[1px] h-24 bg-gradient-to-b from-primary/80 to-transparent origin-top" 
            />
        </section>
    );
}
