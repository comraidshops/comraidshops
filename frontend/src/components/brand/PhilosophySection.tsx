"use client"
import { motion } from "framer-motion"

interface PhilosophySectionProps {
    philosophy?: string;
    awards?: string;
    manifesto?: string;
    featured_quote?: string;
}

export default function PhilosophySection({ philosophy, awards, manifesto, featured_quote }: PhilosophySectionProps) {
    if (!philosophy && !awards && !manifesto && !featured_quote) return null;

    return (
        <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16 overflow-hidden">
            <div className="max-w-4xl mx-auto overflow-hidden">

                {featured_quote && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="mb-24 md:mb-32 text-center"
                    >
                        <blockquote className="text-[clamp(1.5rem,3vw,3rem)] font-light italic leading-tight text-foreground/90 tracking-tight px-4 border-l-0 md:px-12">
                            &ldquo;{featured_quote}&rdquo;
                        </blockquote>
                    </motion.div>
                )}

                {philosophy && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="mb-24 md:mb-32 overflow-hidden"
                    >
                        <h2 className="text-xs uppercase tracking-[0.3em] text-secondary mb-12 text-center md:text-left font-semibold">Philosophy</h2>
                        <div 
                            className="editorial-content space-y-8 text-[18px] md:text-[22px] font-light leading-relaxed tracking-wide text-foreground/90 [overflow-wrap:anywhere!important] [word-break:break-word!important] [white-space:normal!important] max-w-full overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: (philosophy || '').replace(/[\u00A0\u202F\u2007\u2008\u2009\u200A]/g, ' ').replace(/&nbsp;/g, ' ') }}
                        />
                    </motion.div>
                )}


                {manifesto && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                        className="mb-24 md:mb-32 p-10 md:p-16 border border-foreground/5 bg-foreground/[0.02] relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-foreground/20" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-foreground/20" />

                        <h2 className="text-xs uppercase tracking-[0.3em] text-secondary mb-12 text-center md:text-left font-semibold">The Manifesto</h2>
                        <div className="space-y-8 text-[18px] md:text-[22px] font-light leading-relaxed tracking-wide text-foreground/90 italic break-words [overflow-wrap:anywhere] max-w-full overflow-hidden">
                            {manifesto.replace(/[\u00A0\s]/g, ' ').replace(/&nbsp;/g, ' ').split('\n\n').map((paragraph, idx) => (
                                <p key={idx}>{paragraph}</p>
                            ))}
                        </div>
                    </motion.div>
                )}



                {awards && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="pt-16 border-t border-foreground/5"
                    >
                        <span className="block text-xs uppercase tracking-widest text-secondary mb-6 text-center md:text-left font-semibold">Recognition</span>
                        <div className="space-y-4 text-base md:text-lg max-w-2xl text-secondary leading-relaxed font-light">
                            {awards.split('\n\n').map((paragraph, idx) => (
                                <p key={idx}>{paragraph}</p>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    )
}
