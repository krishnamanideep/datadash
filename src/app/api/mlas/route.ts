import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';

const collection = db.collection('mlas');

export interface MLA {
    id?: string;
    assemblyId: string;
    year: string; // '2021', '2016', '2011'
    name: string;
    party: string;
    voteShare?: number;
    votes?: number;
    margin?: number;
    image?: string;
    createdAt?: string;
    updatedAt?: string;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const assemblyId = searchParams.get('assemblyId');
        const year = searchParams.get('year');

        let query: FirebaseFirestore.Query = collection;
        if (assemblyId) {
            query = query.where('assemblyId', '==', assemblyId);
        }
        if (year) {
            query = query.where('year', '==', year);
        }

        const snapshot = await query.get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch MLAs' }, { status: 500 });
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
        return NextResponse.json({ error: 'Failed to create MLA' }, { status: 500 });
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
        return NextResponse.json({ error: 'Failed to update MLA' }, { status: 500 });
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
        return NextResponse.json({ error: 'Failed to delete MLA' }, { status: 500 });
    }
}
