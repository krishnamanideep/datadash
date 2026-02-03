import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';

// Helper to get collection ref
const collection = db.collection('customCards');

export interface CustomCard {
    id?: string;
    assemblyId: string;
    heading: string;
    content: string;
    cardType: 'text' | 'note' | 'info';
    section: 'overview' | 'retro' | 'politicalhistory' | 'survey';
    icon?: string;
    order: number;
    createdAt?: string;
    updatedAt?: string;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const assemblyId = searchParams.get('assemblyId');
        const section = searchParams.get('section');

        let query: FirebaseFirestore.Query = collection;
        if (assemblyId) {
            query = query.where('assemblyId', '==', assemblyId);
        }
        if (section) {
            query = query.where('section', '==', section);
        }

        const snapshot = await query.get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch custom cards' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const now = new Date().toISOString();
        const cardData = {
            ...body,
            createdAt: now,
            updatedAt: now
        };
        const docRef = await collection.add(cardData);
        return NextResponse.json({ id: docRef.id, ...cardData });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create custom card' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;
        if (!id) throw new Error('ID required for update');

        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };
        await collection.doc(id).update(updateData);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update custom card' }, { status: 500 });
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
        return NextResponse.json({ error: 'Failed to delete custom card' }, { status: 500 });
    }
}
