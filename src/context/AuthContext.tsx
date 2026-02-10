'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';

interface AuthUser extends User {
    role?: 'super_admin' | 'admin' | 'client';
    accessibleAssemblies?: string[];
    accessiblePages?: string[];
    accessibleAdminSections?: string[];
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { },
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setLoading(true);
                try {
                    // Fetch user role from Firestore
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    const userData = userDoc.data();

                    const authUser: AuthUser = {
                        ...firebaseUser,
                        role: userData?.role || 'client', // Default to client if no role specified
                        accessibleAssemblies: userData?.accessibleAssemblies || [],
                        accessiblePages: userData?.accessiblePages || [],
                        accessibleAdminSections: userData?.accessibleAdminSections || []
                    };

                    setUser(authUser);
                } catch (error) {
                    console.error('Error fetching user role:', error);
                    // Still set user but maybe without role or handle error
                    setUser(firebaseUser as AuthUser);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        const result = await signInWithEmailAndPassword(auth, email, password);

        // Track login activity
        if (result.user) {
            const userRef = doc(db, 'users', result.user.uid);
            // We use setDoc with merge: true to ensure we don't overwrite other fields
            // but we want to update these specific fields
            try {
                // Import these dynamically or ensure they are imported at top
                // For now, I'll assume I need to add imports to the file header
                const { serverTimestamp, increment, setDoc } = await import('firebase/firestore');

                await setDoc(userRef, {
                    lastLogin: new Date().toISOString(),
                    loginCount: increment(1),
                    email: result.user.email, // Ensure email is always up to date
                }, { merge: true });
            } catch (error) {
                console.error("Failed to track login activity:", error);
                // Don't block login if tracking fails
            }
        }
    };

    const logout = async () => {
        await firebaseSignOut(auth);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
