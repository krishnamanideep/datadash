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
  // Polling Stations (Mock - DISABLED in favor of JSON)
  /*
  for (const ps of data.pollingStations) {
    await db.collection('pollingStations').doc(ps.id).set(ps);
  }
  */

  // GI Data
  if (data.giData) {
    await db.collection('giData').doc('nedungadu').set(data.giData);
  }

  // Survey Data
  if (data.surveyData) {
    await db.collection('surveyData').doc('general').set(data.surveyData);
  }

  // Load JSON data
  const jsonPath = path.join(__dirname, '../Form20_Localities_Pct.json');
  if (fs.existsSync(jsonPath)) {
    const fileContent = fs.readFileSync(jsonPath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    // Iterate over each Assembly key (e.g. "AC_1_FINAL", "AC_2_FINAL")
    for (const [key, stations] of Object.entries(jsonData)) {
      // Extract AC ID from key (AC_1_FINAL -> 1)
      const acIdMatch = key.match(/AC_(\d+)_FINAL/);
      const acId = acIdMatch ? acIdMatch[1] : '0';

      console.log(`Processing ${key} (AC ID: ${acId})...`);

      if (Array.isArray(stations)) {
        for (let i = 0; i < stations.length; i++) {
          const item = (stations[i] as Record<string, any>);
          // Generate an ID based on AC and Index (e.g. 1-1, 1-2)
          // Polling station numbers usually start at 1 for each assembly
          const psNo = i + 1;
          const id = `${acId}-${psNo}`;

          await db.collection('pollingStations').doc(id).set({
            id: id,
            ac_id: acId,
            ac_name: `${key}`, // Store key as name, or could look up real name if needed
            ps_no: psNo.toString(),
            ps_name: item.PS_NO_2021 || `Station ${psNo}`,
            locality: item.LOCALITY_EXTRACTED || '',
            latitude: item.Latitude || 0,
            longitude: item.Longitude || 0,

            // Stats
            nrc_score: item.NRC_SCORE || 0,
            bjp_score: item.BJP_SCORE || 0,
            dmk_score: item.DMK_SCORE || 0,
            aiadmk_score: item.AIADMK_SCORE || 0,
            pmk_score: item.PMK_SCORE || 0,
            ind_score: item.IND_SCORE || 0,
            top_party: item.TOP_SCORE_PARTY || '',
            category: item.TOP_SCORE_CATEGORY || '',

            // Raw Election Data (2021)
            election2021: {
              year: 2021,
              total_votes: item.POLLED_2021 || 0,
              voters: item.VOTERS_2021 || 0,
              turnout: item['POLLED_%'] || 0,
              candidates: {
                BJP: item.BJP_2021_pct || 0,
                DMK: item.DMK_2021_pct || 0,
                NRC: item.NRC_2021_pct || 0,
                OTHERS: item.OTHERS_2021_pct || 0,
                NOTA: item.NOTA_2021_pct || 0
              }
            },

            // Raw Election Data (2016)
            election2016: {
              year: 2016,
              total_votes: item.POLLED_2016 || 0,
              candidates: {
                NRC: item.NRC_2016_pct || 0,
                DMK: item.DMK_2016_pct || 0,
                AIADMK: item.AIADMK_2016_pct || 0,
                OTHERS: item.OTHERS_2016_pct || 0,
                NOTA: item.NOTA_2016_pct || 0
              }
            },

            // Raw Election Data (2011)
            election2011: {
              year: 2011,
              total_votes: item.POLLED_2011 || 0,
              candidates: {
                NRC: item.NRC_2011_pct || 0,
                PMK: item.PMK_2011_pct || 0,
                IND: item.IND_2011_pct || 0,
                OTHERS: item.OTHERS_2011_pct || 0
              }
            },

            original_data: JSON.parse(JSON.stringify(item)) // Sanitize undefined in original data too
          });
        }
      }
    }
  }

  console.log('Seeding complete.');
}

seedFirestore().catch(console.error);