
import { db } from '../src/lib/firebase/admin';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

async function seedFirestore() {
    console.log('Starting Proper Firestore Seeding...');

    const filePath = path.join(process.cwd(), 'Form20_Localities_Pct (1).xlsx');
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        process.exit(1);
    }

    const workbook = XLSX.readFile(filePath);

    // 1. Parse Assembly Mapping from Sheet2
    // Structure: [ID, Name]
    const sheet2 = workbook.Sheets['Sheet2'];
    const assemblyMap: Record<string, string> = {};
    if (sheet2) {
        const rawMap = XLSX.utils.sheet_to_json(sheet2, { header: 1 }) as any[][];
        rawMap.forEach(row => {
            if (row[0] && row[1]) {
                assemblyMap[String(row[0])] = String(row[1]).trim();
            }
        });
        console.log(`Found ${Object.keys(assemblyMap).length} assemblies in mapping.`);
    } else {
        console.warn('Sheet2 (Mapping) not found, using default names.');
    }

    const batchSize = 400;
    let batch = db.batch();
    let opCount = 0;

    async function commitBatch() {
        if (opCount > 0) {
            await batch.commit();
            batch = db.batch();
            opCount = 0;
            console.log('Batch committed.');
        }
    }

    // 2. Iterate Sheets
    for (const sheetName of workbook.SheetNames) {
        if (!sheetName.startsWith('AC_')) continue;

        const acIdMatch = sheetName.match(/AC_(\d+)_/);
        if (!acIdMatch) continue;

        const acId = acIdMatch[1];
        const acName = assemblyMap[acId] || sheetName;
        console.log(`Processing Assembly ${acId}: ${acName}`);

        // Create/Update Assembly Doc
        const assemblyRef = db.collection('assemblies').doc(acId);
        batch.set(assemblyRef, {
            id: acId,
            name: acName,
            number: parseInt(acId),
            sheetName: sheetName
        }, { merge: true });
        opCount++;

        // Parse Polling Stations
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet) as any[];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const psNo = (i + 1).toString(); // Assuming sequential 1-based index
            const id = `${acId}-${psNo}`;

            const psRef = db.collection('pollingStations').doc(id);

            const psData = {
                id: id,
                ac_id: acId,
                ac_name: acName,
                ps_no: psNo,
                ps_name: row['PS_NO_2021'] || `Station ${psNo}`,
                locality: row['LOCALITY_EXTRACTED'] || '',
                latitude: parseFloat(row['Latitude'] || 0),
                longitude: parseFloat(row['Longitude'] || 0),

                // Stats & Scores
                category: row['TOP_SCORE_CATEGORY'] || '',
                strongestParty: row['TOP_SCORE_PARTY'] || '',
                nrc_score: row['NRC_SCORE'] || 0,
                bjp_score: row['BJP_SCORE'] || 0,
                dmk_score: row['DMK_SCORE'] || 0,
                aiadmk_score: row['AIADMK_SCORE'] || 0,
                pmk_score: row['PMK_SCORE'] || 0,
                ind_score: row['IND_SCORE'] || 0,

                // Election 2021
                election2021: {
                    year: 2021,
                    total_votes: row['POLLED_2021'] || 0,
                    voters: row['VOTERS_2021'] || 0,
                    turnout: row['POLLED_%'] || 0,
                    candidates: {
                        BJP: row['BJP_2021_pct'] || 0,
                        DMK: row['DMK_2021_pct'] || 0,
                        NRC: row['NRC_2021_pct'] || 0,
                        OTHERS: row['OTHERS_2021_pct'] || 0,
                        NOTA: row['NOTA_2021_pct'] || 0
                    }
                },

                // Election 2016
                election2016: {
                    year: 2016,
                    total_votes: row['POLLED_2016'] || 0,
                    candidates: {
                        NRC: row['NRC_2016_pct'] || 0,
                        DMK: row['DMK_2016_pct'] || 0,
                        AIADMK: row['AIADMK_2016_pct'] || 0,
                        OTHERS: row['OTHERS_2016_pct'] || 0,
                        NOTA: row['NOTA_2016_pct'] || 0
                    }
                },

                // Election 2011
                election2011: {
                    year: 2011,
                    total_votes: row['POLLED_2011'] || 0,
                    candidates: {
                        NRC: row['NRC_2011_pct'] || 0,
                        PMK: row['PMK_2011_pct'] || 0,
                        IND: row['IND_2011_pct'] || 0,
                        OTHERS: row['OTHERS_2011_pct'] || 0
                    }
                }
            };

            batch.set(psRef, psData);
            opCount++;

            if (opCount >= batchSize) {
                await commitBatch();
            }
        }
    }

    await commitBatch();
    console.log('Seeding Complete!');
}

seedFirestore().catch(console.error);
