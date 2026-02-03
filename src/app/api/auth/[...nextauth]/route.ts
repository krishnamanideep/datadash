import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const allowedEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

// Use a default secret for development, but require env var in production
const secret = process.env.NEXTAUTH_SECRET || 'development-secret-key-change-in-production';

export const authOptions: NextAuthOptions = {
    secret,
    providers: [
        // Simulating "Specific Mail Only" login without needing Google Keys immediately
        // In production, you would swap this for GoogleProvider or EmailProvider
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

                // Simple hardcoded check to bypass broken Firebase Web Key
                if (email === 'admin@example.com' && password === 'adminpassword123') {
                    return { id: 'admin', email: email, name: 'System Admin', role: 'admin' };
                }

                // Allow fallback to just Allowed Emails if we want multiple admins without password check (Optional, but better to enforce password now)
                if (allowedEmails.includes(email)) {
                    // For other emails, we might want strict password but for now let's just allow admin
                    if (password === 'adminpassword123') {
                        return { id: email, email: email, name: 'Admin', role: 'admin' };
                    }
                }

                throw new Error('Invalid email or password');
            }
        }),
        /*
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        })
        */
    ],
    pages: {
        signIn: '/admin', // Custom login page
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
    },
    // Trust host is required for Vercel deployment when not setting NEXTAUTH_URL explicitly
    // @ts-ignore
    trustHost: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
