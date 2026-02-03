import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ token }) => !!token,
    },
    pages: {
        signIn: '/admin',
    },
    secret: process.env.NEXTAUTH_SECRET || 'development-fallback-secret-key-must-be-long-enough',
});

export const config = { matcher: ["/admin/dashboard/:path*"] };
