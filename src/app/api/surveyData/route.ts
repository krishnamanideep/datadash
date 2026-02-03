import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { generateElectionData } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assemblyId = searchParams.get('assemblyId') || '1'; // Default to 1

    const doc = await db.collection('surveyData').doc(assemblyId).get();
    if (doc.exists) {
      const data = doc.data();
      // Check Validity
      if (data && data.votingIntention && Array.isArray(data.votingIntention)) {
        return NextResponse.json(data);
      }
    }
    // Fallback if missing or invalid
    // console.warn(`Survey data missing for Assembly ${assemblyId}, using mock data.`);
    // Return empty/template data instead of mock so editor shows empty state? 
    // Or return mock structure but empty values?
    // Let's return null/empty object so frontend can set defaults
    return NextResponse.json(null);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(null);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assemblyId = searchParams.get('assemblyId');
    const data = await request.json();

    if (!assemblyId) {
      return NextResponse.json({ error: 'Assembly ID required' }, { status: 400 });
    }

    await db.collection('surveyData').doc(assemblyId).set(data);
    return NextResponse.json({ message: 'Survey data updated' });
  } catch {
    return NextResponse.json({ error: 'Failed to update survey data' }, { status: 500 });
  }
}