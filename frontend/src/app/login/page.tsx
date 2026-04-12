'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy Redirect Component
 * 
 * Handles cases where users visit the old /login route (e.g. from old emails
 * or browser cache) and redirects them to the new /auth/login route.
 */
export default function LegacyLoginRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/auth/login');
    }, [router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent animate-spin"></div>
        </div>
    );
}
