'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const createAccount = async (role: 'admin' | 'client') => {
        setLoading(true);
        setStatus(`Creating ${role} account...`);

        const email = role === 'admin' ? 'admin@datadock.com' : 'client@datadock.com';
        const password = role === 'admin' ? 'Admin@123' : 'Client@123';
        const displayName = role === 'admin' ? 'Administrator' : 'Client User';

        try {
            // Try to sign in first to see if user exists
            try {
                await signInWithEmailAndPassword(auth, email, password);
                setStatus(`User ${email} already exists. Updating role...`);
            } catch (e) {
                // If user doesn't exist, create them
                await createUserWithEmailAndPassword(auth, email, password);
                setStatus(`User ${email} created in Auth.`);
            }

            const currentUser = auth.currentUser;
            if (currentUser) {
                await updateProfile(currentUser, { displayName });

                // Write to Firestore
                await setDoc(doc(db, 'users', currentUser.uid), {
                    email,
                    role,
                    displayName,
                    createdAt: new Date().toISOString()
                }, { merge: true });

                setStatus(`${role} account setup complete! Signing out...`);
                await signOut(auth);
                setStatus(`${role} account ready.`);
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
                <h1 className="text-2xl font-bold mb-2 text-center">System Setup</h1>
                <p className="text-center text-xs text-gray-400 mb-6">v1.2 (Hardcoded)</p>

                <div className="space-y-4">
                    <button
                        onClick={() => createAccount('admin')}
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Create Admin Account
                    </button>

                    <button
                        onClick={() => createAccount('client')}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Create Client Account
                    </button>
                </div>

                {status && (
                    <div className="mt-6 p-4 bg-gray-100 rounded text-sm font-mono whitespace-pre-wrap">
                        {status}
                    </div>
                )}



                <div className="mt-6 border-t pt-4">
                    <h3 className="font-semibold mb-2">Credentials:</h3>
                    <div className="text-sm text-gray-600 space-y-2">
                        <p><strong>Admin:</strong> admin@datadock.com / Admin@123</p>
                        <p><strong>Client:</strong> client@datadock.com / Client@123</p>
                    </div>
                </div>

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
