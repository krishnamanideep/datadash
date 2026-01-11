require('dotenv').config();

import admin from 'firebase-admin';

if (!admin.apps.length) {
  const certObj = {
    project_id: process.env.FIREBASE_PROJECT_ID!,
    client_email: process.env.FIREBASE_CLIENT_EMAIL!,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
  };
  console.log('Cert object:', certObj);
  admin.initializeApp({
    credential: admin.credential.cert(certObj as any),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

export const db = admin.firestore();
export const auth = admin.auth();