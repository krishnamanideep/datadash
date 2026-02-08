'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [role, setRole] = useState<'admin' | 'client'>('client');
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const createAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(`Creating ${role} account...`);

        if (password.length < 6) {
            setStatus("Error: Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        try {
            // Try to sign in first to see if user exists
            try {
                await signInWithEmailAndPassword(auth, email, password);
                setStatus(`User ${email} already exists. Updating role to ${role}...`);
            } catch (e) {
                // If user doesn't exist, create them
                await createUserWithEmailAndPassword(auth, email, password);
                setStatus(`User ${email} created in Auth.`);
            }

            const currentUser = auth.currentUser;
            if (currentUser) {
                // Update profile with display name
                if (displayName) {
                    await updateProfile(currentUser, { displayName });
                }

                // Write to Firestore
                await setDoc(doc(db, 'users', currentUser.uid), {
                    email,
                    role,
                    displayName: displayName || (role === 'admin' ? 'Administrator' : 'Client User'),
                    createdAt: new Date().toISOString()
                }, { merge: true });

                setStatus(`Success! ${role} account created/updated for ${email}.`);

                // Optional: Sign out so they can log in properly
                await signOut(auth);

                // Clear form
                setEmail('');
                setPassword('');
                setDisplayName('');
            }
        } catch (error: any) {
            console.error(error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h1 className="text-2xl font-bold mb-6 text-center">System Setup</h1>

                <form onSubmit={createAccount} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="user@datadock.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="********"
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as 'admin' | 'client')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="client">Client</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>

                {status && (
                    <div className={`mt-6 p-4 rounded text-sm whitespace-pre-wrap ${status.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {status}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-blue-600 hover:underline"
                    >
                        Go to Login Page
                    </button>
                </div>
            </div>
        </div>
    );
}
