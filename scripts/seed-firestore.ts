import { db } from '../src/lib/firebase/admin';
import { generateElectionData } from '../src/lib/data';
import fs from 'fs';
import path from 'path';

async function seedFirestore() {
  console.log('Seeding Firestore...');

  // Seed assemblies
  const assemblies = [
    { id: 1, name: 'KARAIKAL', district: 'Karaikal' },
    { id: 2, name: 'TIRUNALLAR', district: 'Karaikal' },
    { id: 3, name: 'NANNILAM', district: 'Karaikal' },
    { id: 4, name: 'NEDUNGADU', district: 'Karaikal' },
    { id: 5, name: 'VILLUPURAM', district: 'Karaikal' },
    { id: 6, name: 'RANIPET', district: 'Karaikal' },
    { id: 7, name: 'PONDICHERRY SOUTH', district: 'Puducherry' },
    { id: 8, name: 'PONDICHERRY NORTH', district: 'Puducherry' },
    { id: 9, name: 'VILLIANUR', district: 'Puducherry' },
    { id: 10, name: 'BAHOUR', district: 'Puducherry' },
    { id: 11, name: 'AUROVILLE', district: 'Puducherry' },
    { id: 12, name: 'OULGARET', district: 'Puducherry' },
    { id: 13, name: 'KALAPET', district: 'Puducherry' },
    { id: 14, name: 'SEDARAPET', district: 'Puducherry' },
    { id: 15, name: 'NETTAPAKKAM', district: 'Puducherry' },
    { id: 16, name: 'ARIANKUPPAM', district: 'Puducherry' },
    { id: 17, name: 'EVUR', district: 'Puducherry' },
    { id: 18, name: 'THATTANCHAVADI', district: 'Puducherry' },
    { id: 19, name: 'YANAM', district: 'Yanam' },
    { id: 20, name: 'PADIBIDRI', district: 'Yanam' },
    { id: 21, name: 'MARUTERU', district: 'Yanam' },
    { id: 22, name: 'MAHE', district: 'Mahe' },
    { id: 23, name: 'CHENKALARI', district: 'Mahe' },
    { id: 24, name: 'KANNUR', district: 'Mahe' },
    { id: 25, name: 'KOZHIKODE', district: 'Mahe' },
    { id: 26, name: 'KODUNGALLOOR', district: 'Mahe' },
    { id: 27, name: 'PERAVOOR', district: 'Mahe' },
    { id: 28, name: 'KURUMBAPETTAI', district: 'Puducherry UT' },
    { id: 29, name: 'TIRUVALLORE', district: 'Puducherry UT' },
    { id: 30, name: 'CHENGALPATTU', district: 'Puducherry UT' },
  ];

  for (const assembly of assemblies) {
    await db.collection('assemblies').doc(assembly.id.toString()).set(assembly);
  }

  // Seed election data
  const data = generateElectionData();

  // Polling Stations
  for (const ps of data.pollingStations) {
    await db.collection('pollingStations').doc(ps.id).set(ps);
  }

  // GI Data
  if (data.giData) {
    await db.collection('giData').doc('nedungadu').set(data.giData);
  }

  // Survey Data
  if (data.surveyData) {
    await db.collection('surveyData').doc('general').set(data.surveyData);
  }

  // Load JSON data
  const jsonPath = path.join(__dirname, '../../Form20_Localities_Pct.json');
  if (fs.existsSync(jsonPath)) {
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    // Assuming jsonData is an array of polling stations
    for (const item of jsonData) {
      const id = `PS-${item.PS_NO_2021}`;
      await db.collection('pollingStations').doc(id).set({
        id,
        ac_id: '24', // Assuming Nedungadu
        ac_name: 'NEDUNGADU',
        ps_no: item.PS_NO_2021,
        ps_name: item.PS_NO_2021, // Use the name if available
        locality: item.LOCALITY_EXTRACTED,
        latitude: item.Latitude,
        longitude: item.Longitude,
        // Add election data
        election2021: {
          candidates: {
            AINRC: item.AINRC_2021_pct,
            DMK: item.DMK_2021_pct,
            ANGALANE: item.ANGALANE_2021_pct,
            OTHERS: item.OTHERS_2021_pct,
            NOTA: item.NOTA_2021_pct,
          },
          year: 2021,
        },
        // Add more as needed
      });
    }
  }

  console.log('Seeding complete.');
}

seedFirestore().catch(console.error);