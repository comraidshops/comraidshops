'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, UserCheck, Shield, 
    Search, Check, Trash2, Edit3, Mail, AlertCircle
} from 'lucide-react';
import { safeFetch } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';
import { AdminModal, AdminInput, AdminSelect } from '@/components/admin/AdminForms';
import { useDebounce } from '@/lib/hooks';

interface User {
    id: number;
    username: string;
    email: string;
    is_vendor: boolean;
    is_vendor_approved: boolean;
    is_customer: boolean;
    is_superuser: boolean;
    is_staff: boolean;
    date_joined: string;
    vendor_brand_id?: number | null;
}

interface Brand {
    id: number;
    name: string;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [filter, setFilter] = useState<'all' | 'vendors' | 'pending'>('all');
    
    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const { notify } = useNotification();


    async function getBrands() {
        try {
            // Note: Since this is public data, /brands/ works, but if there's an admin-api we would use that.
            // Adjust if needed, but assuming /brands/ returns all brands.
            const data = await safeFetch('/brands/');
            setBrands(data);
        } catch (error) {
            console.error("Failed to fetch brands:", error);
        }
    }

    async function getUsers() {
        try {
            const data = await safeFetch('/admin-api/users/');
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    }

    useEffect(() => {
        getUsers();
        getBrands();
    }, []);

    async function approveVendor(userId: number) {
        try {
            await safeFetch(`/admin-api/users/${userId}/approve_vendor/`, { method: 'POST' });
            setUsers(users.map(u => u.id === userId ? { ...u, is_vendor_approved: true } : u));
            notify('success', 'Vendor Approved', 'The vendor account has been successfully approved.');
        } catch (error: unknown) {
            notify('error', 'Approval Failed', (error as Error)?.message || "Failed to approve vendor");
        }
    }

    async function handleUpdateUser(e: React.FormEvent) {
        e.preventDefault();
        if (!currentUser) return;
        setActionLoading(true);
        try {
            // Remove read-only fields and fields that shouldn't be patched directly
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { date_joined, id, ...updateData } = currentUser;
            
            const updated = await safeFetch(`/admin-api/users/${currentUser.id}/`, {
                method: 'PATCH',
                body: JSON.stringify(updateData)
            });
            setUsers(users.map(u => u.id === currentUser.id ? updated : u));
            setIsEditModalOpen(false);
            notify('success', 'User Updated', `Account details for ${currentUser.username} have been saved.`);
        } catch (error: unknown) {
            const errorMsg = (error as Error)?.message || "Check network or permissions";
            notify('error', 'Update Failed', errorMsg);
        } finally {
            setActionLoading(false);
        }
    }

    async function handleDeleteUser() {
        if (!currentUser) return;
        setActionLoading(true);
        try {
            await safeFetch(`/admin-api/users/${currentUser.id}/`, { method: 'DELETE' });
            setUsers(users.filter(u => u.id !== currentUser.id));
            setIsDeleteModalOpen(false);
            notify('success', 'User Deleted', 'The user account has been permanently removed.');
        } catch (error: unknown) {
            notify('error', 'Delete Failed', (error as Error)?.message || "Failed to delete user");
        } finally {
            setActionLoading(false);
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
                             user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || 
                             (filter === 'vendors' && user.is_vendor) || 
                             (filter === 'pending' && user.is_vendor && !user.is_vendor_approved);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 lg:space-y-12">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">Community Management</span>
                    <h1 className="text-4xl lg:text-5xl font-playfair font-medium tracking-tight">Users & <span className="italic opacity-80">Curators.</span></h1>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative w-full lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                            type="text" 
                            placeholder="Search username or email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all w-full"
                        />
                    </div>
                </div>
            </header>

            <div className="flex flex-wrap gap-3 lg:gap-4 border-b border-white/5 pb-8">
                {[
                    { id: 'all', label: 'All Users' },
                    { id: 'vendors', label: 'All Vendors' },
                    { id: 'pending', label: 'Pending' },
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id as 'all' | 'vendors' | 'pending')}
                        className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all ${
                            filter === f.id 
                            ? 'bg-primary text-black' 
                            : 'bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/5 border border-white/5'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">User</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Role</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Joined</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {filteredUsers.map((user, idx) => (
                                <motion.tr 
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-lg font-bold border border-white/5">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold tracking-tight">{user.username}</span>
                                                    {user.is_superuser && <Shield className="w-3 h-3 text-primary" />}
                                                </div>
                                                <span className="text-[10px] font-bold text-white/40">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-2">
                                            {user.is_superuser && <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest">Admin</span>}
                                            {user.is_staff && !user.is_superuser && <span className="px-3 py-1 rounded-full bg-orange-400/10 text-orange-400 text-[8px] font-black uppercase tracking-widest">Staff</span>}
                                            {user.is_vendor && <span className="px-3 py-1 rounded-full bg-blue-400/10 text-blue-400 text-[8px] font-black uppercase tracking-widest">Vendor</span>}
                                            {user.is_customer && <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-widest">Member</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {user.is_vendor ? (
                                            user.is_vendor_approved ? (
                                                <div className="flex items-center gap-2 text-primary">
                                                    <UserCheck className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Approved</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-orange-400">
                                                    <AlertCircle className="w-4 h-4" size={16} />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Pending</span>
                                                </div>
                                            )
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Verified User</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-bold text-white/40">{new Date(user.date_joined).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {user.is_vendor && !user.is_vendor_approved && (
                                                <button 
                                                    onClick={() => approveVendor(user.id)}
                                                    className="p-3 rounded-xl bg-primary text-black hover:scale-110 transition-transform"
                                                    title="Approve Vendor"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    setCurrentUser(user);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-3 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                                                title="Edit User"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setCurrentUser(user);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="p-3 rounded-xl bg-white/5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredUsers.map((user, idx) => (
                        <motion.div 
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-5 md:p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold border border-white/5">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold tracking-tight flex items-center gap-2 break-all">
                                            {user.username}
                                            {user.is_superuser && <Shield className="w-3 h-3 text-primary shrink-0" />}
                                        </h4>
                                        <p className="text-[10px] text-white/40 break-all">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            setCurrentUser(user);
                                            setIsEditModalOpen(true);
                                        }}
                                        className="p-2 rounded-lg bg-white/5 text-white/60"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setCurrentUser(user);
                                            setIsDeleteModalOpen(true);
                                        }}
                                        className="p-2 rounded-lg bg-white/5 text-red-400/60"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {user.is_superuser && <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest">Admin</span>}
                                {user.is_staff && !user.is_superuser && <span className="px-3 py-1 rounded-full bg-orange-400/10 text-orange-400 text-[8px] font-black uppercase tracking-widest">Staff</span>}
                                {user.is_vendor && <span className="px-3 py-1 rounded-full bg-blue-400/10 text-blue-400 text-[8px] font-black uppercase tracking-widest">Vendor</span>}
                                {user.is_customer && <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-widest">Member</span>}
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <div>
                                    {user.is_vendor ? (
                                        user.is_vendor_approved ? (
                                            <span className="text-[8px] font-black uppercase tracking-widest text-primary px-3 py-1 rounded-full bg-primary/10">Approved</span>
                                        ) : (
                                            <span className="text-[8px] font-black uppercase tracking-widest text-orange-400 px-3 py-1 rounded-full bg-orange-400/10">Pending</span>
                                        )
                                    ) : (
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20 px-3 py-1 rounded-full bg-white/5">User</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {user.is_vendor && !user.is_vendor_approved && (
                                        <button 
                                            onClick={() => approveVendor(user.id)}
                                            className="p-3 rounded-xl bg-primary text-black"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button className="p-3 rounded-xl bg-white/5 text-white/60">
                                        <Mail className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredUsers.length === 0 && (
                <div className="p-12 lg:p-24 text-center">
                    <Users className="w-12 h-12 text-white/5 mx-auto mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">No matching members found</p>
                </div>
            )}

            {/* Edit User Modal */}
            <AdminModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                title="Edit Curator"
                loading={actionLoading}
            >
                <form onSubmit={handleUpdateUser} className="space-y-6">
                    <AdminInput 
                        label="Username" 
                        value={currentUser?.username || ''} 
                        onChange={(e) => setCurrentUser(currentUser ? { ...currentUser, username: e.target.value } : null)}
                    />
                    <AdminInput 
                        label="Email Address" 
                        value={currentUser?.email || ''} 
                        onChange={(e) => setCurrentUser(currentUser ? { ...currentUser, email: e.target.value } : null)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <AdminSelect 
                            label="Vendor Status"
                            value={currentUser?.is_vendor ? 'true' : 'false'}
                            onChange={(e) => setCurrentUser(currentUser ? { ...currentUser, is_vendor: e.target.value === 'true' } : null)}
                            options={[
                                { value: 'false', label: 'Member' },
                                { value: 'true', label: 'Vendor' }
                            ]}
                        />
                        {currentUser?.is_vendor && (
                            <AdminSelect 
                                label="Assigned Brand"
                                value={currentUser?.vendor_brand_id?.toString() || ''}
                                onChange={(e) => setCurrentUser(currentUser ? { ...currentUser, vendor_brand_id: e.target.value ? parseInt(e.target.value) : null } : null)}
                                options={[
                                    { value: '', label: 'None' },
                                    ...brands.map(b => ({ value: b.id.toString(), label: b.name }))
                                ]}
                            />
                        )}
                        <AdminSelect 
                            label="Role"
                            value={currentUser?.is_superuser ? 'superuser' : (currentUser?.is_staff ? 'staff' : 'standard')}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'superuser') {
                                    setCurrentUser(currentUser ? { ...currentUser, is_superuser: true, is_staff: true } : null);
                                } else if (val === 'staff') {
                                    setCurrentUser(currentUser ? { ...currentUser, is_superuser: false, is_staff: true } : null);
                                } else {
                                    setCurrentUser(currentUser ? { ...currentUser, is_superuser: false, is_staff: false } : null);
                                }
                            }}
                            options={[
                                { value: 'standard', label: 'Standard' },
                                { value: 'staff', label: 'Staff' },
                                { value: 'superuser', label: 'Superuser' }
                            ]}
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-primary text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all"
                    >
                        Save Changes
                    </button>
                </form>
            </AdminModal>

            {/* Delete Confirmation Modal */}
            <AdminModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                title="Strict Removal"
                loading={actionLoading}
            >
                <div className="space-y-8">
                    <p className="text-white/40 text-[11px] font-bold leading-relaxed uppercase tracking-widest">
                        You are about to permanently remove <span className="text-white">@{currentUser?.username}</span> from the platform. This action is irreversible and will delete all associated data.
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-grow bg-white/5 text-white/40 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleDeleteUser}
                            className="flex-grow bg-red-500 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                        >
                            Delete Forever
                        </button>
                    </div>
                </div>
            </AdminModal>
        </div>
    );
}
