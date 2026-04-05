import React, { useState } from 'react';
import { Bell, CheckCircle, XCircle, Package, X } from 'lucide-react';

export interface Notification {
    id: string;
    message: string;
    type: string;
    read: boolean;
    created_at: string;
}

interface NotificationsPanelProps {
    notifications: Notification[];
    onMarkRead?: (id: string) => void;
}

export default function NotificationsPanel({ notifications, onMarkRead }: NotificationsPanelProps) {
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    const getIcon = (type: string) => {
        switch (type) {
            case 'new_order': return <Package className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />;
            case 'product_approved': 
            case 'withdrawal_approved': return <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />;
            case 'product_rejected':
            case 'withdrawal_rejected': return <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500" />;
            default: return <Bell className="w-4 h-4 md:w-5 md:h-5 text-secondary" />;
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        setSelectedNotification(notification);
        if (!notification.read && onMarkRead) {
            onMarkRead(notification.id);
        }
    };

    return (
        <div className="bg-background border border-border relative">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-border flex justify-between items-center">
                <h3 className="text-[11px] md:text-sm font-bold uppercase tracking-widest">Recent Notifications</h3>
                <span className="text-[10px] md:text-xs text-secondary bg-secondary/10 px-2 py-0.5 md:py-1 rounded-full font-bold">
                    {notifications.filter(n => !n.read).length} New
                </span>
            </div>
            <div className="divide-y divide-border max-h-[350px] md:max-h-[400px] overflow-y-auto">
                {notifications.map((notification) => (
                    <div 
                        key={notification.id} 
                        onClick={() => handleNotificationClick(notification)}
                        className={`px-3 py-3 md:p-4 flex gap-3 md:gap-4 cursor-pointer hover:bg-secondary/10 transition-colors active:bg-secondary/15 ${!notification.read ? 'bg-secondary/5' : ''}`}
                    >
                        <div className="mt-0.5 flex-shrink-0">
                            {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-[13px] md:text-sm leading-snug ${!notification.read ? 'font-medium' : 'text-secondary'}`}>
                                {notification.message}
                            </p>
                            <p className="text-[10px] md:text-xs text-secondary/60 mt-1">{new Date(notification.created_at).toLocaleDateString()}</p>
                        </div>
                        {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        )}
                    </div>
                ))}
                {notifications.length === 0 && (
                    <div className="p-6 md:p-8 text-center text-sm text-secondary">
                        No recent notifications
                    </div>
                )}
            </div>

            {/* Notification Modal Preview */}
            {selectedNotification && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-background border border-border w-full md:max-w-md p-5 md:p-6 shadow-2xl relative rounded-t-2xl md:rounded-none">
                        <button 
                            onClick={() => setSelectedNotification(null)}
                            className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        {/* Drag indicator for mobile */}
                        <div className="md:hidden w-10 h-1 bg-secondary/20 rounded-full mx-auto mb-4" />

                        <div className="flex items-center gap-3 mb-5 md:mb-6">
                            {getIcon(selectedNotification.type)}
                            <h2 className="text-[11px] md:text-sm font-bold uppercase tracking-widest">Notification Details</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <p className="text-[15px] md:text-base text-foreground leading-relaxed">
                                {selectedNotification.message}
                            </p>
                            <p className="text-[10px] md:text-xs text-secondary font-medium tracking-widest uppercase border-t border-border pt-4">
                                Received: {new Date(selectedNotification.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
