import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const assemblyId = searchParams.get('assemblyId');

        const collection = db.collection('candidates');
        let query: FirebaseFirestore.Query = collection;
        if (assemblyId) {
            query = query.where('assemblyId', '==', assemblyId);
        }

        const snapshot = await query.get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(data);
    } catch (error: any) {
        if (error.message?.includes('Firebase not initialized')) {
            return NextResponse.json([]);
        }
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const collection = db.collection('candidates');
        const docRef = await collection.add(body);
        return NextResponse.json({ id: docRef.id, ...body });
    } catch (error: any) {
        if (error.message?.includes('Firebase not initialized')) {
            return NextResponse.json({ error: 'Database not connected (Firebase config missing)' }, { status: 503 });
        }
        return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
    }
}


export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;
        if (!id) throw new Error('ID required for update');

        const collection = db.collection('candidates');
        await collection.doc(id).update(data);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message?.includes('Firebase not initialized')) {
            return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
        }
        return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const collection = db.collection('candidates');
        await collection.doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message?.includes('Firebase not initialized')) {
            return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
        }
        return NextResponse.json({ error: 'Failed to delete candidate' }, { status: 500 });
    }
}

