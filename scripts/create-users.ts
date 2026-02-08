
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        const certObj = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

        if (!certObj.projectId || !certObj.clientEmail || !certObj.privateKey) {
            throw new Error('Missing Firebase Admin credentials in .env.local');
        }

        admin.initializeApp({
            credential: admin.credential.cert(certObj),
        });
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
        process.exit(1);
    }
}

const auth = getAuth();
const db = getFirestore();

const users = [
    {
        email: 'admin@datadock.com',
        password: 'Admin@123',
        role: 'admin',
        displayName: 'Administrator'
    },
    {
        email: 'client@datadock.com',
        password: 'Client@123',
        role: 'client',
        displayName: 'Client User'
    }
];

async function seedUsers() {
    console.log('Starting user seeding...');

    for (const user of users) {
        try {
            let uid;
            try {
                // Check if user exists
                const userRecord = await auth.getUserByEmail(user.email);
                uid = userRecord.uid;
                console.log(`User ${user.email} already exists. Updating...`);

                await auth.updateUser(uid, {
                    password: user.password,
                    displayName: user.displayName,
                });
            } catch (error: any) {
                if (error.code === 'auth/user-not-found') {
                    // Create new user
                    console.log(`Creating user ${user.email}...`);
                    const userRecord = await auth.createUser({
                        email: user.email,
                        password: user.password,
                        displayName: user.displayName,
                    });
                    uid = userRecord.uid;
                } else {
                    throw error;
                }
            }

            // Set role in Firestore
            await db.collection('users').doc(uid).set({
                email: user.email,
                role: user.role,
                displayName: user.displayName,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });

            console.log(`Successfully processed ${user.email} with role ${user.role}`);

        } catch (error) {
            console.error(`Error processing ${user.email}:`, error);
        }
    }

    console.log('User seeding completed.');
    process.exit(0);
}

seedUsers();
