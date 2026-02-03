import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';

const collection = db.collection('politicalHistoryConfig');

export interface PoliticalHistoryInsight {
    id?: string;
    assemblyId: string;
    title: string;
    content: string;
    type: 'highlight' | 'trend' | 'warning' | 'info';
    order: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface PoliticalHistoryConfig {
    assemblyId: string;
    showElectoralTrends: boolean;
    showVoteSwing: boolean;
    showInsights: boolean;
    customNarrative?: string;
    insights: PoliticalHistoryInsight[];
}

// GET - Fetch config and insights for an assembly
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const assemblyId = searchParams.get('assemblyId');

        if (!assemblyId) {
            return NextResponse.json({ error: 'assemblyId required' }, { status: 400 });
        }

        // Get config document
        const configDoc = await collection.doc(`config_${assemblyId}`).get();
        const config = configDoc.exists ? configDoc.data() : {
            assemblyId,
            showElectoralTrends: true,
            showVoteSwing: true,
            showInsights: true,
            customNarrative: '',
            insights: []
        };

        // Get insights subcollection
        const insightsSnap = await collection.doc(`config_${assemblyId}`).collection('insights').orderBy('order').get();
        const insights = insightsSnap.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({ ...config, insights });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

// POST - Save config
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { assemblyId, insights, ...configData } = body;

        if (!assemblyId) {
            return NextResponse.json({ error: 'assemblyId required' }, { status: 400 });
        }

        const now = new Date().toISOString();

        // Save config
        await collection.doc(`config_${assemblyId}`).set({
            assemblyId,
            ...configData,
            updatedAt: now
        }, { merge: true });

        // If insights provided, update them
        if (insights && Array.isArray(insights)) {
            const batch = db.batch();
            const insightsRef = collection.doc(`config_${assemblyId}`).collection('insights');

            // Delete existing insights first
            const existing = await insightsRef.get();
            existing.docs.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => batch.delete(doc.ref));

            // Add new insights
            insights.forEach((insight: PoliticalHistoryInsight, index: number) => {
                const docRef = insightsRef.doc();
                batch.set(docRef, {
                    ...insight,
                    order: index,
                    updatedAt: now
                });
            });

            await batch.commit();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }
}
