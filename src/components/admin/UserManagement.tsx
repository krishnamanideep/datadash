import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { User, Shield, Calendar, Activity, Search, Edit2, X, Check, Save } from 'lucide-react';
import { ASSEMBLIES } from '@/data/assemblies';

interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    role: 'admin' | 'client';
    lastLogin?: string;
    loginCount?: number;
    accessibleAssemblies?: string[]; // Array of Assembly IDs
    createdAt?: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [saving, setSaving] = useState(false);

    // Fetch Users
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const usersRef = collection(db, 'users');
            // Note: orderBy might require an index if mixed with where clauses, 
            // but fetching all users for admin panel is usually okay for small-medium apps.
            const q = query(usersRef);
            const snapshot = await getDocs(q);

            const fetchedUsers: UserProfile[] = [];
            snapshot.forEach(doc => {
                fetchedUsers.push({ uid: doc.id, ...doc.data() } as UserProfile);
            });

            // Client-side sort by lastLogin desc
            fetchedUsers.sort((a, b) => {
                const dateA = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
                const dateB = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
                return dateB - dateA;
            });

            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!editingUser) return;
        setSaving(true);
        try {
            const userRef = doc(db, 'users', editingUser.uid);
            await updateDoc(userRef, {
                role: editingUser.role,
                accessibleAssemblies: editingUser.accessibleAssemblies || []
            });

            // Update local state
            setUsers(users.map(u => u.uid === editingUser.uid ? editingUser : u));
            setEditingUser(null);
            alert("User updated successfully!");
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user.");
        }
        setSaving(false);
    };

    const toggleAssemblyAccess = (assemblyId: string) => {
        if (!editingUser) return;

        const currentAccess = editingUser.accessibleAssemblies || [];
        let newAccess;

        if (currentAccess.includes(assemblyId)) {
            newAccess = currentAccess.filter(id => id !== assemblyId);
        } else {
            newAccess = [...currentAccess, assemblyId];
        }

        setEditingUser({ ...editingUser, accessibleAssemblies: newAccess });
    };

    const toggleAllAssemblies = () => {
        if (!editingUser) return;

        const allIds = ASSEMBLIES.map(a => a.id);
        const currentAccess = editingUser.accessibleAssemblies || [];

        if (currentAccess.length === allIds.length) {
            // Deselect all
            setEditingUser({ ...editingUser, accessibleAssemblies: [] });
        } else {
            // Select all
            setEditingUser({ ...editingUser, accessibleAssemblies: allIds });
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (isoString?: string) => {
        if (!isoString) return 'Never';
        return new Date(isoString).toLocaleString();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="text-blue-600" /> User Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage user access and view activity logs</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600 text-sm">User</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Role</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Last Active</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm text-center">Logins</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Access</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map(user => (
                                <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{user.displayName || 'No Name'}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user.role === 'admin' ? <Shield size={12} className="mr-1" /> : <User size={12} className="mr-1" />}
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} className="text-gray-400" />
                                            {formatDate(user.lastLogin)}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                            <Activity size={12} className="text-gray-500" />
                                            {user.loginCount || 0}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {user.role === 'admin' ? (
                                            <span className="text-gray-400 italic">Global Admin Access</span>
                                        ) : (
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {(user.accessibleAssemblies?.length || 0) === 0 ? (
                                                    <span className="text-red-500 text-xs">No Access</span>
                                                ) : (
                                                    <>
                                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                                            {user.accessibleAssemblies?.length} Assemblies
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => setEditingUser(user)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit Access"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No users found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h2 className="text-xl font-bold text-gray-800">Edit User Access</h2>
                            <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">User Info</label>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="font-semibold text-gray-900">{editingUser.displayName}</div>
                                        <div className="text-sm text-gray-500">{editingUser.email}</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'admin' | 'client' })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="client">Client</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Admins have full access to all assemblies automatically.</p>
                                </div>
                            </div>

                            {editingUser.role === 'client' && (
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-medium text-gray-700">Access Control ({editingUser.accessibleAssemblies?.length || 0} Selected)</label>
                                        <button
                                            onClick={toggleAllAssemblies}
                                            className="text-xs text-blue-600 font-medium hover:underline"
                                        >
                                            {editingUser.accessibleAssemblies?.length === ASSEMBLIES.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="max-h-60 overflow-y-auto bg-gray-50 p-2 grid grid-cols-2 gap-2">
                                            {ASSEMBLIES.map(assembly => {
                                                const isSelected = editingUser.accessibleAssemblies?.includes(assembly.id);
                                                return (
                                                    <label
                                                        key={assembly.id}
                                                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:border-blue-200'
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected || false}
                                                            onChange={() => toggleAssemblyAccess(assembly.id)}
                                                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
                                                        />
                                                        <span className={`text-sm ${isSelected ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                                                            {assembly.name} <span className="text-xs text-gray-400">({assembly.id})</span>
                                                        </span>
                                                        {isSelected && <Check size={14} className="ml-auto text-blue-600" />}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Users will only see data for selected assemblies in their dashboard.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                            >
                                {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
