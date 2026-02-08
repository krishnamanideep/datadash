import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBuTaqQh7CHKavGuj2aA_eCJeFgdmBNXcE",
  authDomain: "datadash-459eb.firebaseapp.com",
  projectId: "datadash-459eb",
  storageBucket: "datadash-459eb.firebasestorage.app",
  messagingSenderId: "539490922086",
  appId: "1:539490922086:web:33872fd02be425af68c7a7",
  measurementId: "G-QZZ4IB4PL3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);