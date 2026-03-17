'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function HeroStatement() {
    return (
        <section className="relative h-screen w-full overflow-hidden bg-black text-white flex flex-col items-center justify-center">
            {/* Background Media - Editorial Placeholder */}
            <div className="absolute inset-0 z-0 opacity-60">
                <Image
                    src="/images/selected-not-stocked.jpg"
                    alt="Selected Not Stocked"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-12">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} // Custom easing for "inevitable" feel
                    className="text-6xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.9]"
                >
                    Selected, <br /> Not Stocked.
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                    className="h-16 w-[1px] bg-white/50 mx-auto mt-12" // Visual anchor
                />
            </div>
        </section>
    );
}
