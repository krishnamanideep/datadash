import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/firebase/admin';

// READ (GET)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const assemblyId = searchParams.get('assemblyId');

        if (!assemblyId) {
            return NextResponse.json({ error: 'Assembly ID required' }, { status: 400 });
        }

        // New Hierarchical Path: assemblies/{id}
        const docRef = db.collection('assemblies').doc(assemblyId);
        const doc = await docRef.get();

        if (doc.exists) {
            return NextResponse.json(doc.data());
        }

        return NextResponse.json({}); // Return empty if not found (Editor will handle defaults)

    } catch (error) {
        console.error('Error getting assembly meta:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

// WRITE (POST)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { assemblyId, ...data } = body;

        if (!assemblyId) {
            return NextResponse.json({ error: 'Assembly ID required' }, { status: 400 });
        }

        // Save to assemblies/{id}
        // We use merge: true to preserve existing fields like 'name', 'number'
        await db.collection('assemblies').doc(assemblyId).set(data, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving assembly meta:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
