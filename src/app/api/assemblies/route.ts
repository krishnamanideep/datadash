import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { ASSEMBLIES } from '@/lib/assemblies';

export async function GET() {
  try {
    const snapshot = await db.collection('assemblies').get();
    const data = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching assemblies, falling back to mock data:', error);
    return NextResponse.json(ASSEMBLIES);
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