'use client';

import { AuthProvider } from '../../context/LocalAuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}
