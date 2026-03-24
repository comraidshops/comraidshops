'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Check } from 'lucide-react';

interface SocialShareProps {
    title: string;
    url?: string;
}

export default function SocialShare({ title, url }: SocialShareProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        setShareUrl(url || window.location.href);

        const handleScroll = () => {
            // Show after scrolling 400px (past hero)
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [url]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareLinks = [
        {
            name: 'X',
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
        },
        {
            name: 'Instagram',
            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
            ),
            href: `https://www.instagram.com/`, // Direct sharing is limited on web
        },
    ];

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Desktop Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-4 p-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl"
                    >
                        {shareLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center rounded-full text-secondary hover:text-foreground hover:bg-white/10 transition-all duration-300"
                                title={`Share on ${link.name}`}
                            >
                                {link.icon}
                            </a>
                        ))}
                        <button
                            onClick={handleCopyLink}
                            className="w-10 h-10 flex items-center justify-center rounded-full text-secondary hover:text-foreground hover:bg-white/10 transition-all duration-300 relative"
                            title="Copy Link"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
                            {copied && (
                                <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute left-full ml-4 text-[8px] uppercase tracking-widest bg-foreground text-background px-2 py-1 rounded whitespace-nowrap"
                                >
                                    Copied
                                </motion.span>
                            )}
                        </button>
                    </motion.div>

                    {/* Mobile Bottom Pill */}
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 xl:hidden flex items-center gap-6 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
                    >
                        {shareLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary hover:text-foreground transition-colors"
                            >
                                {link.icon}
                            </a>
                        ))}
                        <div className="w-[1px] h-4 bg-white/20"></div>
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-2 text-secondary hover:text-foreground transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
                            <span className="text-[10px] font-bold uppercase tracking-widest">{copied ? 'Copied' : 'Share'}</span>
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
