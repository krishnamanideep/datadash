'use client';

import { AuthProvider } from "../../context/LocalAuthContext";

export default function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}
