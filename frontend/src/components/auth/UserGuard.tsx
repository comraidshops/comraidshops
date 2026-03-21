'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { safeFetch } from '@/lib/api-utils';

export default function UserGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            try {
                // Use safeFetch which handles token refresh automatically
                const data = await safeFetch('/user/profile/');
                if (data) {
                    setAuthorized(true);
                } else {
                    localStorage.clear();
                    router.push('/auth/login');
                }
            } catch (err) {
                console.error("Auth check failed:", err);
                localStorage.clear();
                router.push('/auth/login');
            }
        };

        checkAuth();
    }, [router]);

    if (!authorized) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
}
