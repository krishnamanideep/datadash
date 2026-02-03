
import { auth } from '../src/lib/firebase/admin';

async function createAdmin() {
    const email = 'admin@example.com';
    const password = 'adminpassword123';

    try {
        // Check if user exists
        try {
            const existingUser = await auth.getUserByEmail(email);
            console.log(`User ${email} already exists (UID: ${existingUser.uid}). Updating password...`);
            await auth.updateUser(existingUser.uid, { password });
            console.log('Password updated to: ' + password);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                const newUser = await auth.createUser({
                    email,
                    password,
                    displayName: 'System Admin'
                });
                console.log(`Created new user: ${email} (UID: ${newUser.uid})`);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

createAdmin();
