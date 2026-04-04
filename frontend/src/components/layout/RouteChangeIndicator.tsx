'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function RouteChangeIndicator() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);
    const prevPathRef = useRef(pathname);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Intercept all click events on anchor elements to show loading immediately
        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest('a');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href) return;

            // Skip external links, hash links, and same-page anchors
            if (
                href.startsWith('http') ||
                href.startsWith('#') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                anchor.target === '_blank'
            ) {
                return;
            }

            // Skip if modifier keys are pressed (new tab behavior)
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;

            // Don't trigger if clicking the current page link
            const currentPath = window.location.pathname + window.location.search;
            if (href === currentPath || href === pathname) return;

            // Start the loading indicator
            setIsNavigating(true);

            // Safety timeout — auto-hide after 8s in case something goes wrong
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setIsNavigating(false);
            }, 8000);
        };

        document.addEventListener('click', handleClick, true);
        return () => {
            document.removeEventListener('click', handleClick, true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [pathname]);

    useEffect(() => {
        // When the pathname actually changes, the route has completed loading
        if (prevPathRef.current !== pathname) {
            prevPathRef.current = pathname;

            // Small delay so the bar feels like it "completed"
            const completeTimer = setTimeout(() => {
                setIsNavigating(false);
            }, 300);

            return () => clearTimeout(completeTimer);
        }
    }, [pathname, searchParams]);

    return (
        <AnimatePresence>
            {isNavigating && (
                <motion.div
                    key="route-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
                >
                    {/* Progress Bar */}
                    <div className="h-[2px] w-full overflow-hidden">
                        <div className="route-progress-bar h-full bg-white" />
                    </div>

                    {/* Subtle glow below bar */}
                    <div className="h-[1px] w-full overflow-hidden">
                        <div className="route-progress-bar h-full bg-white/30 blur-[2px]" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
