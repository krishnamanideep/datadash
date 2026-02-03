import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
// import { generateElectionData } from '@/lib/data'; // No longer needed for GET fallback

// ... imports
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assemblyId = searchParams.get('assemblyId');

    let query;

    if (assemblyId) {
      // Fetch from specific assembly subcollection
      console.log(`Fetching polling stations for Assembly ID: ${assemblyId}`);
      query = db.collection('assemblies').doc(assemblyId).collection('polling_stations');
    } else {
      // Fetch ALL stations using Collection Group Query
      console.log('Fetching ALL polling stations via collectionGroup');
      query = db.collectionGroup('polling_stations');
    }

    const snapshot = await query.get();

    if (!snapshot.empty) {
      const data = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      }));
      return NextResponse.json(data);
    }

    console.warn('Firestore returned empty. Checking local JSON fallback...');

    // Fallback to local JSON
    const jsonPath = path.join(process.cwd(), 'Form20_Localities_Pct.json');
    if (fs.existsSync(jsonPath)) {
      const fileContent = fs.readFileSync(jsonPath, 'utf-8');
      const jsonData = JSON.parse(fileContent);

      let allStations: any[] = [];

      // Transform JSON structure to flat array matching PollingStation interface
      Object.keys(jsonData).forEach(key => {
        if (key.startsWith('AC_') && key.endsWith('_FINAL')) {
          const acId = key.replace('AC_', '').replace('_FINAL', '');
          const stations = jsonData[key].map((station: any, index: number) => {
            // Dynamic candidate mapping
            const candidates2021: Record<string, number> = {};
            const candidates2016: Record<string, number> = {};
            const candidates2011: Record<string, number> = {};

            Object.keys(station).forEach(k => {
              if (k.endsWith('_2021_pct')) {
                const party = k.replace('_2021_pct', '');
                candidates2021[party] = station[k];
              } else if (k.endsWith('_2016_pct')) {
                const party = k.replace('_2016_pct', '');
                candidates2016[party] = station[k];
              } else if (k.endsWith('_2011_pct')) {
                const party = k.replace('_2011_pct', '');
                candidates2011[party] = station[k];
              }
            });

            // Map fields to PollingStation interface
            return {
              id: `${acId}_${station.PS_NO_2021 || index}`,
              ac_id: acId,
              ps_no: station.PS_NO_2021,
              ps_name: station.PS_NO_2021, // Use same for name if name field missing
              locality: station.LOCALITY_EXTRACTED,
              latitude: station.Latitude,
              longitude: station.Longitude,
              category: station.TOP_SCORE_CATEGORY,
              strongestParty: station.TOP_SCORE_PARTY,

              // Map election data
              election2021: {
                year: 2021,
                total_votes: station.POLLED_2021,
                candidates: candidates2021
              },
              election2016: {
                year: 2016,
                total_votes: station.POLLED_2016,
                candidates: candidates2016
              },
              election2011: {
                year: 2011,
                total_votes: station.POLLED_2011,
                candidates: candidates2011
              }
            };
          });

          // Filter by assemblyID if requested
          if (assemblyId) {
            if (acId === assemblyId) {
              allStations = stations;
            }
          } else {
            allStations = [...allStations, ...stations];
          }
        }
      });

      return NextResponse.json(allStations);
    }

    return NextResponse.json([]);

  } catch (error) {
    console.error('API Error:', error);
    // Fallback to empty array
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ac_id, ...data } = body;

    if (!id || !ac_id) {
      return NextResponse.json({ error: 'Missing ID or AC_ID' }, { status: 400 });
    }

    // Save to hierarchical path
    await db.collection('assemblies').doc(String(ac_id)).collection('polling_stations').doc(id).set({
      id,
      ac_id,
      ...data
    }, { merge: true });

    return NextResponse.json({ message: 'Polling station added/updated' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to add polling station' }, { status: 500 });
  }
}