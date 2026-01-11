import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';

export async function GET() {
  try {
    const snapshot = await db.collection('pollingStations').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch polling stations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    await db.collection('pollingStations').doc(id).set(data);
    return NextResponse.json({ message: 'Polling station added/updated' });
  } catch {
    return NextResponse.json({ error: 'Failed to add polling station' }, { status: 500 });
  }
}