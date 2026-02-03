import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';

export async function GET() {
    try {
        const doc = await db.collection('system_config').doc('dashboard_v1').get();
        if (doc.exists) {
            return NextResponse.json(doc.data());
        }
        return NextResponse.json(null);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const config = await request.json();
        await db.collection('system_config').doc('dashboard_v1').set(config);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }
}
