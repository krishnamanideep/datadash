import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Use a robust fallback secret
const secret = process.env.NEXTAUTH_SECRET || 'development-fallback-secret-key-must-be-long-enough';

export const authOptions: NextAuthOptions = {
    secret,
    providers: [
        CredentialsProvider({
            name: 'Admin Access',
            credentials: {
                email: { label: "Email", type: "email", placeholder: "admin@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const email = credentials.email.toLowerCase();
                const password = credentials.password;

                // 1. Hardcoded Super Admin
                if (email === 'admin@example.com' && password === 'adminpassword123') {
                    return { id: 'admin', email: email, name: 'System Admin', role: 'admin' };
                }

                // 2. Allowed Emails check
                const allowedEmailsStr = process.env.ADMIN_EMAILS || '';
                const allowedEmails = allowedEmailsStr.split(',').map(e => e.trim().toLowerCase());

                if (allowedEmails.includes(email)) {
                    if (password === 'adminpassword123') {
                        return { id: email, email: email, name: 'Admin', role: 'admin' };
                    }
                }

                return null; // Return null instead of throwing error for cleaner UI handling
            }
        })
    ],
    pages: {
        signIn: '/admin',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = 'admin';
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    debug: process.env.NODE_ENV === 'development',
    // @ts-ignore
    trustHost: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
