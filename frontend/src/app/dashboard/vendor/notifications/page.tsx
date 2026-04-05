'use client';

import React, { useEffect, useState } from 'react';
import NotificationsPanel, { Notification } from '@/components/vendor/NotificationsPanel';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/notifications/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    const formatted: Notification[] = data.map((n: { 
                        id: number; 
                        message: string; 
                        type: string; 
                        read: boolean; 
                        created_at: string; 
                    }) => ({
                        id: n.id.toString(),
                        message: n.message,
                        type: n.type,
                        read: n.read,
                        created_at: n.created_at
                    }));
                    setNotifications(formatted);
                } else {
                    // Mock
                    setNotifications([
                        { id: '1', message: 'Your withdrawal request for $1,200 has been approved.', type: 'withdrawal_approved', read: false, created_at: new Date().toISOString() },
                        { id: '2', message: 'New order received for Ceramic Vase.', type: 'new_order', read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
                    ]);
                }
            } catch (error) {
                console.error("Error fetching notifications", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const handleMarkRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            const token = localStorage.getItem('access_token');
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/notifications/${id}/mark_read/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            window.dispatchEvent(new Event('notifications_updated'));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        try {
            const token = localStorage.getItem('access_token');
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/notifications/mark_all_read/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            window.dispatchEvent(new Event('notifications_updated'));
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    return (
        <div className="space-y-5 md:space-y-8 max-w-4xl">
            <div className="flex justify-between items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tighter">Notifications</h2>
                <button 
                    onClick={handleMarkAllRead}
                    className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors active:scale-95 whitespace-nowrap"
                >
                    Mark all as read
                </button>
            </div>
            
            {loading ? (
                <div className="flex justify-center py-12">
                    <p className="text-secondary uppercase tracking-widest text-xs">Loading notifications...</p>
                </div>
            ) : (
                <NotificationsPanel 
                    notifications={notifications} 
                    onMarkRead={handleMarkRead}
                />
            )}
        </div>
    );
}
