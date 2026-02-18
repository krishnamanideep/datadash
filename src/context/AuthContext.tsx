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
    login: (email: string, password: string) => Promise<{
        uid: string;
        role: 'super_admin' | 'admin' | 'client' | string;
        accessibleAssemblies: string[];
        accessiblePages: string[];
        accessibleAdminSections: string[];
    }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => ({
        uid: '',
        role: 'client',
        accessibleAssemblies: [],
        accessiblePages: [],
        accessibleAdminSections: []
    }),
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            // setLoading(true); // Don't reset loading on auth state change to prevent UI flash/unmount
            if (firebaseUser) {
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
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);

            // Fetch user role from Firestore immediately
            const userDoc = await getDoc(doc(db, 'users', result.user.uid));
            const userData = userDoc.data();

            // Track login activity
            const userRef = doc(db, 'users', result.user.uid);
            const { increment, setDoc } = await import('firebase/firestore');

            await setDoc(userRef, {
                lastLogin: new Date().toISOString(),
                loginCount: increment(1),
                email: result.user.email,
            }, { merge: true });

            return {
                uid: result.user.uid,
                role: userData?.role || 'client',
                accessibleAssemblies: userData?.accessibleAssemblies || [],
                accessiblePages: userData?.accessiblePages || [],
                accessibleAdminSections: userData?.accessibleAdminSections || []
            };
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const logout = async () => {
        await firebaseSignOut(auth);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {loading ? (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-xl uppercase tracking-tighter">D</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">DataBoard</h2>
                            <p className="text-sm text-gray-500 font-medium animate-pulse mt-1">
                                Securely loading your workspace...
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
