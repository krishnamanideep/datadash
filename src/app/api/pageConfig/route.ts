import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';

// Collection to store page configurations
const collection = db.collection('pageConfigs');

export interface PageConfig {
    id?: string;
    assemblyId: string;
    pageType: 'retrobooths'; // Can extend to other pages
    showPollingTable: boolean;
    showHeatMap: boolean;
    showWeakBooths: boolean;
    showIndependentHotspots: boolean;
    showCustomCards: boolean;
    heatMapTitle: string;
    heatMapDescription: string;
    retroBoothsTitle?: string;
    retroBoothsDescription?: string;
    updatedAt?: string;
}

// Default config
const defaultConfig: Omit<PageConfig, 'assemblyId' | 'pageType'> = {
    showPollingTable: true,
    showHeatMap: true,
    showWeakBooths: true,
    showIndependentHotspots: true,
    showCustomCards: true,
    heatMapTitle: 'BJP vs DMK Vote Share Analysis (2021)',
    heatMapDescription: 'Visualizing booth-wise performance distribution. Each point represents a polling booth.',
    retroBoothsTitle: 'Retro Booths',
    retroBoothsDescription: 'Booths with consistent strong performance for a party'
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const assemblyId = searchParams.get('assemblyId');
        const pageType = searchParams.get('pageType') || 'retrobooths';

        if (!assemblyId) {
            return NextResponse.json({ error: 'assemblyId is required' }, { status: 400 });
        }

        // Try to find existing config
        const snapshot = await collection
            .where('assemblyId', '==', assemblyId)
            .where('pageType', '==', pageType)
            .limit(1)
            .get();

        if (snapshot.empty) {
            // Return default config
            return NextResponse.json({
                ...defaultConfig,
                assemblyId,
                pageType
            });
        }

        const doc = snapshot.docs[0];
        return NextResponse.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch page config' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { assemblyId, pageType = 'retrobooths', ...configData } = body;

        if (!assemblyId) {
            return NextResponse.json({ error: 'assemblyId is required' }, { status: 400 });
        }

        // Check if config exists
        const snapshot = await collection
            .where('assemblyId', '==', assemblyId)
            .where('pageType', '==', pageType)
            .limit(1)
            .get();

        const now = new Date().toISOString();

        if (snapshot.empty) {
            // Create new config
            const docRef = await collection.add({
                assemblyId,
                pageType,
                ...configData,
                updatedAt: now
            });
            return NextResponse.json({ id: docRef.id, success: true });
        } else {
            // Update existing config
            const docId = snapshot.docs[0].id;
            await collection.doc(docId).update({
                ...configData,
                updatedAt: now
            });
            return NextResponse.json({ id: docId, success: true });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save page config' }, { status: 500 });
    }
}
