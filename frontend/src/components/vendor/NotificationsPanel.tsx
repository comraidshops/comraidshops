import React, { useState } from 'react';
import { Bell, CheckCircle, XCircle, Package, X, ArrowRight, Clock } from 'lucide-react';

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
            case 'new_order': return <Package className="w-4 h-4 text-primary" />;
            case 'product_approved': 
            case 'withdrawal_approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'product_rejected':
            case 'withdrawal_rejected': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Bell className="w-4 h-4 text-secondary/40" />;
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        setSelectedNotification(notification);
        if (!notification.read && onMarkRead) {
            onMarkRead(notification.id);
        }
    };

    return (
        <div className="bg-background/20 backdrop-blur-sm border border-white/5 flex flex-col h-full overflow-hidden group">
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Activity Feed
                </h3>
                <span className="text-[9px] text-secondary/40 font-black uppercase tracking-widest border border-white/10 px-3 py-1">
                    {notifications.filter(n => !n.read).length} Unread
                </span>
            </div>
            
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar flex-1">
                {notifications.map((notification) => (
                    <div 
                        key={notification.id} 
                        onClick={() => handleNotificationClick(notification)}
                        className={`px-6 py-5 flex gap-5 cursor-pointer hover:bg-white/[0.04] transition-all duration-300 relative group/item ${!notification.read ? 'bg-white/[0.02]' : ''}`}
                    >
                        {/* Status line */}
                        {!notification.read && (
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                        )}

                        <div className="mt-1 flex-shrink-0">
                            <div className={`w-10 h-10 flex items-center justify-center border border-white/5 transition-all duration-300 ${!notification.read ? 'bg-primary text-background' : 'bg-background text-secondary/20 group-hover/item:border-white/10'}`}>
                                {getIcon(notification.type)}
                            </div>
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-2">
                            <p className={`text-[12px] leading-relaxed tracking-tight ${!notification.read ? 'font-black text-primary' : 'font-medium text-secondary/60'}`}>
                                {notification.message}
                            </p>
                            <div className="flex items-center gap-3">
                                <p className="text-[8px] font-black text-secondary/30 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <span className="text-secondary/10">•</span>
                                <p className="text-[8px] font-black text-secondary/30 uppercase tracking-[0.2em]">
                                    {new Date(notification.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex-shrink-0 self-center opacity-0 group-hover/item:opacity-100 transition-all translate-x-[-10px] group-hover/item:translate-x-0">
                            <ArrowRight className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                ))}
                {notifications.length === 0 && (
                    <div className="p-12 text-center">
                        <Bell className="w-8 h-8 text-secondary/10 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.3em]">
                            System Idle
                        </p>
                    </div>
                )}
            </div>

            {/* Notification Modal Preview - upgraded to editorial style */}
            {selectedNotification && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-background border border-white/5 w-full max-w-lg p-10 md:p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden group/modal">
                        {/* Decorative corner */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                        
                        <button 
                            onClick={() => setSelectedNotification(null)}
                            className="absolute top-8 right-8 text-secondary/40 hover:text-primary transition-all duration-300 hover:rotate-90 p-2 border border-white/5 hover:border-white/20"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-8">
                            <div className="w-12 h-12 flex items-center justify-center bg-primary text-background border border-primary shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                {getIcon(selectedNotification.type)}
                            </div>
                            <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary/40">Communication Signal</h2>
                                <p className="text-[11px] font-black uppercase tracking-widest text-primary mt-1">{selectedNotification.type.replace(/_/g, ' ')}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-8">
                            <p className="text-xl md:text-2xl font-black text-primary leading-tight tracking-tight italic font-source-serif">
                                "{selectedNotification.message}"
                            </p>
                            
                            <div className="pt-8 border-t border-white/5 flex justify-between items-end">
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-secondary/30">Timestamp</p>
                                    <p className="text-[11px] font-bold text-primary mt-1 uppercase tracking-widest">
                                        {new Date(selectedNotification.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedNotification(null)}
                                    className="px-8 py-3 bg-primary text-background text-[10px] font-black uppercase tracking-[0.25em] hover:bg-primary/90 transition-all active:scale-95 shadow-lg"
                                >
                                    Dismiss Signal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
