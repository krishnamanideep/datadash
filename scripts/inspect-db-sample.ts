
import { db } from '../src/lib/firebase/admin';

async function inspectSample() {
    console.log('--- Inspecting Sample Polling Station Data ---');
    try {
        // Try to get a station from Assembly 1
        const snapshot = await db.collection('assemblies').doc('1').collection('polling_stations').limit(1).get();

        if (snapshot.empty) {
            console.log('No polling stations found for Assembly 1.');
            return;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();
        console.log('Document ID:', doc.id);
        console.log('--- Election 2021 Data ---');
        const e21 = data.election2021;
        if (e21) {
            console.log('Total Votes (Field):', e21.total_votes);
            console.log('Candidates:', JSON.stringify(e21.candidates, null, 2));
        } else {
            console.log('No election2021 data found.');
        }
    } catch (error) {
        console.error('Error fetching sample:', error);
    }
}

inspectSample();
