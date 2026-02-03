import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { generateElectionData } from '@/lib/data';

export async function GET() {
  try {
    const doc = await db.collection('giData').doc('nedungadu').get();
    if (!doc.exists) return NextResponse.json({});
    return NextResponse.json(doc.data());
  } catch (error) {
    console.error('Error fetching GI data, falling back to mock data:', error);
    const mockData = generateElectionData();
    return NextResponse.json(mockData.giData);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    await db.collection('giData').doc('nedungadu').set(data);
    return NextResponse.json({ message: 'GI data updated' });
  } catch {
    return NextResponse.json({ error: 'Failed to update GI data' }, { status: 500 });
  }
}