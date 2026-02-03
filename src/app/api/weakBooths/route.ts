import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';

const collection = db.collection('weakBooths');

export interface WeakBooth {
    id?: string;
    assemblyId: string;
    party: 'BJP' | 'DMK' | 'AIADMK' | string;
    locality: string;
    psNo?: string;
    score: number;
    notes?: string;
    order: number;
    createdAt?: string;
    updatedAt?: string;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const assemblyId = searchParams.get('assemblyId');
        const party = searchParams.get('party');

        let query: FirebaseFirestore.Query = collection;
        if (assemblyId) {
            query = query.where('assemblyId', '==', assemblyId);
        }
        if (party) {
            query = query.where('party', '==', party);
        }

        const snapshot = await query.get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch weak booths' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const now = new Date().toISOString();
        const data = {
            ...body,
            createdAt: now,
            updatedAt: now
        };
        const docRef = await collection.add(data);
        return NextResponse.json({ id: docRef.id, ...data });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create weak booth' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await collection.doc(id).update({
            ...data,
            updatedAt: new Date().toISOString()
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update weak booth' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await collection.doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete weak booth' }, { status: 500 });
    }
}
