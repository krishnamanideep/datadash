import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';

export async function GET() {
  try {
    const snapshot = await db.collection('assemblies').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch assemblies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    await db.collection('assemblies').doc(id.toString()).set(data);
    return NextResponse.json({ message: 'Assembly added/updated' });
  } catch {
    return NextResponse.json({ error: 'Failed to add assembly' }, { status: 500 });
  }
}