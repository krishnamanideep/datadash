import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
// import { generateElectionData } from '@/lib/data'; // No longer needed for GET fallback

// ... imports
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assemblyId = searchParams.get('assemblyId');

    let query;

    if (assemblyId) {
      // Fetch from specific assembly subcollection
      console.log(`Fetching polling stations for Assembly ID: ${assemblyId}`);
      query = db.collection('assemblies').doc(assemblyId).collection('polling_stations');
    } else {
      // Fetch ALL stations using Collection Group Query
      console.log('Fetching ALL polling stations via collectionGroup');
      query = db.collectionGroup('polling_stations');
    }

    const snapshot = await query.get();

    if (!snapshot.empty) {
      const data = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      }));
      return NextResponse.json(data);
    }

    console.warn('Firestore returned empty. Checking fallbacks...');
    throw new Error("Firestore empty");

  } catch (error) {
    console.error('API Error:', error);
    // Fallback to local JSON if safe
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ac_id, ...data } = body;

    if (!id || !ac_id) {
      return NextResponse.json({ error: 'Missing ID or AC_ID' }, { status: 400 });
    }

    // Save to hierarchical path
    await db.collection('assemblies').doc(String(ac_id)).collection('polling_stations').doc(id).set({
      id,
      ac_id,
      ...data
    }, { merge: true });

    return NextResponse.json({ message: 'Polling station added/updated' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to add polling station' }, { status: 500 });
  }
}