import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const filePath = path.join(process.cwd(), 'Form20_Localities_Pct (1).xlsx');

if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
}

const workbook = XLSX.readFile(filePath);


console.log('Sheet Names:', JSON.stringify(workbook.SheetNames, null, 2));



const acSheet = workbook.Sheets['AC_1_FINAL'];
const acData = XLSX.utils.sheet_to_json(acSheet, { header: 1 });
console.log('\n--- AC_1_FINAL Headers ---');
console.log(acData[0]);




// Check if there is a mapping sheet or if names are sheet names
