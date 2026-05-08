'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Send, Users, Shield, MessageSquare, 
    CheckCircle, AlertCircle, Search, Filter,
    ChevronRight, Info
} from 'lucide-react';
import { safeFetch } from '@/lib/api';

interface User {
    id: number;
    username: string;
    email: string;
    is_investor: boolean;
    is_vendor: boolean;
}

interface SentMessage {
    id: number;
    title: string;
    content: string;
    role_target: string;
    created_at: string;
    sender_username: string;
    recipient_count: number;
}

export default function AdminMessaging() {
    const [users, setUsers] = useState<User[]>([]);
    const [history, setHistory] = useState<SentMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [recipientType, setRecipientType] = useState('broadcast_investors'); // 'broadcast_investors', 'broadcast_vendors', 'multiple'
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const [usersData, historyData] = await Promise.all([
                    safeFetch('/admin-api/users/'),
                    safeFetch('/admin-api/broadcast/')
                ]);
                setUsers(usersData || []);
                setHistory(historyData || []);
            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) {
            setError("Title and message are required.");
            return;
        }
        if (recipientType === 'multiple' && selectedUsers.length === 0) {
            setError("Please select at least one recipient.");
            return;
        }

        setSending(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await safeFetch('/admin-api/broadcast/', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    message,
                    recipient_type: recipientType,
                    selected_users: recipientType === 'multiple' ? selectedUsers : []
                })
            });

            setSuccess(response.message || "Message sent successfully.");
            setTitle('');
            setMessage('');
            setSelectedUsers([]);
            
            // Refresh history (separate try/catch so success state isn't lost)
            try {
                const historyData = await safeFetch('/admin-api/broadcast/');
                setHistory(historyData || []);
            } catch (refreshErr) {
                console.error("Failed to refresh message history:", refreshErr);
            }
            
            // Auto-hide success message after 5 seconds
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || "Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    const toggleUserSelection = (userId: number) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId) 
                : [...prev, userId]
        );
    };

    const filteredUsers = users.filter(user => 
        (user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
         user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (recipientType === 'multiple' ? true : 
         recipientType === 'broadcast_investors' ? user.is_investor : 
         recipientType === 'broadcast_vendors' ? user.is_vendor : true)
    );

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            <header className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Communications Hub</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-playfair font-medium tracking-tight">
                    Admin <span className="italic opacity-80">Messaging.</span>
                </h1>
                <p className="text-white/40 text-sm max-w-2xl">
                    Dispatch secure, one-way administrative updates and notifications to specific roles or individual stakeholders across the platform.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                {/* Form Section */}
                <div className="lg:col-span-3 space-y-8">
                    <form onSubmit={handleSendMessage} className="space-y-8 bg-white/[0.02] border border-white/5 p-8 lg:p-12 rounded-[40px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
                        
                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Dispatch Protocol</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { id: 'broadcast_investors', label: 'All Investors', icon: Shield },
                                        { id: 'broadcast_vendors', label: 'All Vendors', icon: Users },
                                        { id: 'multiple', label: 'Selective Node', icon: Filter },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setRecipientType(type.id)}
                                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${recipientType === type.id ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                                        >
                                            <type.icon className="w-5 h-5" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Message Header</label>
                                <input 
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter administrative title..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Content Body</label>
                                <textarea 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Draft your secure message here..."
                                    rows={8}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                />
                            </div>

                            {success && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center gap-3 text-primary">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-xs font-bold uppercase tracking-widest">{success}</span>
                                </motion.div>
                            )}

                            {error && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
                                </motion.div>
                            )}

                            <div className="pt-4">
                                <button 
                                    disabled={sending}
                                    className="w-full bg-primary text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sending ? 'Encrypting & Dispatching...' : 'Initiate Secure Dispatch'}
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl flex items-start gap-4">
                        <Info className="w-5 h-5 text-white/20 mt-1 flex-shrink-0" />
                        <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest">
                            Important: This system is strictly for one-way administrative communication. Recipients will receive in-app notifications and email alerts. Messages cannot be edited once dispatched to the network.
                        </p>
                    </div>
                </div>

                {/* Recipient Selection Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40">Target Nodes</h2>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{filteredUsers.length} Found</span>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by name or email..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-[40px] h-[600px] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                                {recipientType === 'multiple' ? 'Selection Required' : 'Auto-Selected Recipients'}
                            </span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {loading ? (
                                <div className="h-full flex items-center justify-center opacity-20">
                                    <div className="w-8 h-8 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                </div>
                            ) : filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => recipientType === 'multiple' && toggleUserSelection(user.id)}
                                    disabled={recipientType !== 'multiple'}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                        recipientType === 'multiple' 
                                            ? selectedUsers.includes(user.id)
                                                ? 'bg-primary/10 border-primary/20 text-primary'
                                                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                                            : 'bg-white/[0.01] border-white/[0.02] text-white/40 cursor-default'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${user.is_investor ? 'bg-blue-400/10 text-blue-400' : 'bg-purple-400/10 text-purple-400'}`}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[11px] font-bold tracking-tight">{user.username}</p>
                                            <p className="text-[9px] opacity-40">{user.email}</p>
                                        </div>
                                    </div>
                                    {recipientType === 'multiple' && selectedUsers.includes(user.id) && <CheckCircle className="w-4 h-4" />}
                                    <div className="flex gap-1">
                                        {user.is_investor && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" title="Investor" />}
                                        {user.is_vendor && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" title="Vendor" />}
                                    </div>
                                </button>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-white/10 text-center p-8">
                                    <Search className="w-10 h-10 mb-4 opacity-10" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">No matching nodes found</p>
                                </div>
                            )}
                        </div>

                        {recipientType === 'multiple' && (
                            <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{selectedUsers.length} Selected</span>
                                    <button 
                                        onClick={() => setSelectedUsers([])}
                                        className="text-[9px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
                                    >
                                        Clear Selection
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Message History Section */}
            <div className="space-y-6 pt-12 border-t border-white/5">
                <header className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-playfair font-medium tracking-tight">Transmission Archive</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Previously dispatched system broadcasts</p>
                    </div>
                </header>

                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex justify-center opacity-20">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        </div>
                    ) : history.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {history.map((msg) => (
                                <div key={msg.id} className="p-6 lg:p-8 hover:bg-white/[0.01] transition-colors">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-bold tracking-tight">{msg.title}</h3>
                                            <div className="flex items-center gap-3 text-[10px] text-white/40 font-black uppercase tracking-widest">
                                                <span>By {msg.sender_username}</span>
                                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                                <span>{new Date(msg.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/60">
                                                Target: {msg.role_target}
                                            </div>
                                            <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                                                <Users className="w-3 h-3" />
                                                {msg.recipient_count} Delivered
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-white/10">
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center flex flex-col items-center">
                            <MessageSquare className="w-8 h-8 text-white/10 mb-3" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">No messages in archive</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
