
import { db } from '../src/lib/firebase/admin';

async function verifyFullDb() {
    console.log('Verifying Full Database Hierarchy...');

    let totalStations = 0;
    let assembliesWithData = 0;

    for (let i = 1; i <= 30; i++) {
        const acId = i.toString();
        const snapshot = await db.collection('assemblies').doc(acId).collection('polling_stations').count().get();
        const count = snapshot.data().count;

        if (count > 0) {
            console.log(`Assembly ${acId}: ${count} stations`);
            assembliesWithData++;
            totalStations += count;
        } else {
            console.warn(`Assembly ${acId}: 0 stations (Empty)`);
        }
    }

    console.log('--- Verification Summary ---');
    console.log(`Assemblies with Data: ${assembliesWithData}/30`);
    console.log(`Total Polling Stations: ${totalStations}`);
}

verifyFullDb().catch(console.error);
