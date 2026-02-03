import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Force load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const serviceAccountKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

if (!serviceAccountKey) {
    console.error('FIREBASE_PRIVATE_KEY is missing');
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: serviceAccountKey,
        }),
    });
}

const db = admin.firestore();

const candidates = [
    {
        assemblyId: '1',
        name: 'Candidate A',
        party: 'BJP',
        age: 45,
        education: 'MBA, IIM Bangalore',
        experience: '10 years in public service',
        strengths: ['Strong grassroots network', 'Development focus', 'Youth appeal'],
        weaknesses: ['New to electoral politics', 'Limited name recognition'],
        constituency: 'Assembly 1',
    },
    {
        assemblyId: '1',
        name: 'Candidate B',
        party: 'DMK',
        age: 52,
        education: 'MA Political Science',
        experience: '15 years in party organization',
        strengths: ['Incumbent advantage', 'Welfare schemes', 'Local connections'],
        weaknesses: ['Anti-incumbency factors', 'Age perception'],
        constituency: 'Assembly 1',
    },
    {
        assemblyId: '1',
        name: 'Candidate C',
        party: 'AIADMK',
        age: 48,
        education: 'B.Tech, Engineering',
        experience: '8 years MLA',
        strengths: ['Administrative experience', 'Infrastructure projects'],
        weaknesses: ['Party fragmentation', 'Leadership issues'],
        constituency: 'Assembly 1',
    },
];

async function seed() {
    console.log('Seeding candidates...');
    for (const c of candidates) {
        await db.collection('candidates').add(c);
        console.log('Added', c.name);
    }
    console.log('Done');
}

seed().catch(console.error);
