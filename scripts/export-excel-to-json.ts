
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

async function exportJson() {
    console.log('Exporting Excel to JSON...');
    const filePath = path.join(process.cwd(), 'Form20_Localities_Pct (1).xlsx');
    const workbook = XLSX.readFile(filePath);

    // 1. Parse Assembly Mapping
    const sheet2 = workbook.Sheets['Sheet2'];
    const assemblyMap: Record<string, string> = {};
    if (sheet2) {
        const rawMap = XLSX.utils.sheet_to_json(sheet2, { header: 1 }) as any[][];
        rawMap.forEach(row => {
            if (row[0] && row[1]) assemblyMap[String(row[0])] = String(row[1]).trim();
        });
    }

    const allStations: any[] = [];

    for (const sheetName of workbook.SheetNames) {
        if (!sheetName.startsWith('AC_')) continue;
        const acIdMatch = sheetName.match(/AC_(\d+)_/);
        if (!acIdMatch) continue;

        const acId = acIdMatch[1];
        const acName = assemblyMap[acId] || sheetName;
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet) as any[];

        rows.forEach((row, i) => {
            const psNo = (i + 1).toString();
            const id = `${acId}-${psNo}`;

            allStations.push({
                id: id,
                ac_id: acId,
                ac_name: acName,
                ps_no: psNo,
                ps_name: row['PS_NO_2021'] || `Station ${psNo}`,
                locality: row['LOCALITY_EXTRACTED'] || '',
                latitude: parseFloat(row['Latitude'] || 0),
                longitude: parseFloat(row['Longitude'] || 0),
                category: row['TOP_SCORE_CATEGORY'] || '',
                strongestParty: row['TOP_SCORE_PARTY'] || '',

                election2021: {
                    candidates: {
                        BJP: row['BJP_2021_pct'] || 0,
                        DMK: row['DMK_2021_pct'] || 0,
                        NRC: row['NRC_2021_pct'] || 0,
                        OTHERS: row['OTHERS_2021_pct'] || 0
                    }
                },
                election2016: {
                    candidates: {
                        NRC: row['NRC_2016_pct'] || 0,
                        DMK: row['DMK_2016_pct'] || 0,
                        AIADMK: row['AIADMK_2016_pct'] || 0,
                        OTHERS: row['OTHERS_2016_pct'] || 0
                    }
                },
                election2011: {
                    candidates: {
                        NRC: row['NRC_2011_pct'] || 0,
                        PMK: row['PMK_2011_pct'] || 0,
                        IND: row['IND_2011_pct'] || 0,
                        OTHERS: row['OTHERS_2011_pct'] || 0
                    }
                }
            });
        });
    }

    const outPath = path.join(process.cwd(), 'src/data/polling_stations_fallback.json');
    // Ensure dir exists
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(outPath, JSON.stringify(allStations, null, 2));
    console.log(`Exported ${allStations.length} stations to ${outPath}`);
}

exportJson();
