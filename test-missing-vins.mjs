import 'dotenv/config';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';

const token = process.env.CLICKSIGN_API_TOKEN;
const tmpDir = '/tmp/clicksign-pdfs';
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

// Documents that had NO VINs extracted - only closed ones
const missingVinDocs = [
  { key: 'a88c42a2-7f20-4c3d-ac75-0dace7b51c97', name: 'EXUBERANTE - Sandoval Gonçalves' },
  { key: '93a24a14-1474-4712-bd53-d16e3af300a7', name: 'JULIANO Equinazi' },
  { key: 'b3e18526-e6dc-4fde-8baa-148bfdc377ea', name: 'SILVESTRE Kuhnen' },
  { key: 'fa49eb4d-dbc9-4afa-b424-fd75bad1e954', name: 'RICHARD SEIXAS' },
  { key: '13ae2e39-ecbd-4104-a60f-5f09727b3199', name: 'SIDNEI Hartof' },
  { key: '2eb2a2d2-4798-4f89-a9da-53251b8d0174', name: 'AFG&M AGE - Jaime/Alexandre' },
  { key: '7d9dad59-3658-48da-8506-f31aab40c8df', name: 'MARIA LUZIA de Melo Neto' },
  { key: 'f3acfc7b-d8ee-409a-9690-4f6024e660d7', name: 'VINICIUS Granzotto' },
  // André Mos Pucciarelli - closed version
  { key: '0c7d2d8e-closed', name: 'ANDRE Mos Pucciarelli' }, // need to find actual key
  { key: '264709328-rosangela', name: 'ROSANGELA Faustino' }, // need to find actual key
];

// Let's get all documents and process only closed ones without VINs
const listRes = await fetch(`https://app.clicksign.com/api/v1/documents?access_token=${token}&page=1&per_page=30`);
const listData = await listRes.json();

// Check if there are more pages
console.log('Page info:', JSON.stringify(listData.page_info));
console.log(`Documents on page 1: ${listData.documents.length}`);

// Get page 2 if exists
let allDocs = [...listData.documents];
if (listData.page_info?.next_page) {
  const p2Res = await fetch(`https://app.clicksign.com/api/v1/documents?access_token=${token}&page=2&per_page=30`);
  const p2Data = await p2Res.json();
  allDocs = [...allDocs, ...p2Data.documents];
  console.log(`Documents on page 2: ${p2Data.documents.length}`);
}

// Known VIN-found doc keys (skip these)
const vinFoundKeys = new Set([
  'd9cbdb76-1330-428e-80b2-1a5cee20e813', // Hiby (closed version has VIN)
  '39b1921d-beb8-470d-a2f7-927f336810cb', // Lucas Rodrigues
  'ef93db98-672a-4fd8-ac30-2e166cbc29e5', // Erickson
  'fedb783f-3869-4b96-9dc2-64b2b18db1c3', // Vitor
  '1b48eac8-d08d-429e-9599-43c93dc195a0', // Rafael/Denis
  '01e7c2e2-6809-442b-bccb-2dec20ff14ee', // Fabricio
  'd68c73c1-7e1f-40d4-996c-d9c907b8db60', // Sergio/TDS2
  'e36138ad-e69e-4036-81fa-5dc579b784cf', // Henrique Baratella
  '18f2b691-b0be-4634-9a25-10921dc786a8', // James Demarchi
  'dda83a34-119f-4cff-97c2-06f8cddf7578', // Diego/Felipe
  '1GCEK14Z4PZ162623', // Roberto (has VIN)
  '93RLDHME81T003625', // Paulo Fonseca (has VIN)
]);

// Process closed documents that didn't have VINs
for (const doc of allDocs) {
  if (doc.status !== 'closed') continue;
  if (vinFoundKeys.has(doc.key)) continue;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Analyzing: ${doc.filename} [${doc.key}]`);
  
  const dRes = await fetch(`https://app.clicksign.com/api/v1/documents/${doc.key}?access_token=${token}`);
  const dData = await dRes.json();
  const d = dData.document;
  
  if (!d.downloads?.original_file_url) {
    console.log('  No download URL available');
    continue;
  }
  
  const pdfPath = `${tmpDir}/${doc.key}.pdf`;
  const textPath = `${tmpDir}/${doc.key}.txt`;
  
  // Download if not already cached
  if (!existsSync(pdfPath)) {
    const pdfRes = await fetch(d.downloads.original_file_url);
    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
    writeFileSync(pdfPath, pdfBuffer);
  }
  
  execSync(`pdftotext "${pdfPath}" "${textPath}" 2>/dev/null`);
  const rawText = readFileSync(textPath, 'utf8');
  const text = rawText.replace(/\n/g, ' ').replace(/\s+/g, ' ');
  
  // Broader VIN search patterns
  // 1. Standard 17-char VIN
  const vin17 = text.match(/\b[A-HJ-NPR-Z0-9]{17}\b/gi) || [];
  
  // 2. "chassis" keyword followed by any alphanumeric string
  const chassisPattern = /chassis\s*(?:n[°ºo.]?\s*)?[:.]?\s*([A-Za-z0-9]{5,17})/gi;
  const chassisMatches = [];
  let m;
  while ((m = chassisPattern.exec(text)) !== null) chassisMatches.push(m[1]);
  
  // 3. "VIN" keyword
  const vinKeyword = /VIN\s*[:.]?\s*([A-Za-z0-9]{5,17})/gi;
  const vinKeyMatches = [];
  while ((m = vinKeyword.exec(text)) !== null) vinKeyMatches.push(m[1]);
  
  // 4. Brazilian plate pattern (ABC-1234 or ABC1D23)
  const platePattern = /\b([A-Z]{3}[-\s]?\d[A-Z0-9]\d{2})\b/gi;
  const plates = text.match(platePattern) || [];
  
  // 5. Look for any long alphanumeric sequence that could be a chassis
  const longAlphaNum = /\b([A-Z0-9]{8,17})\b/gi;
  const longMatches = [];
  while ((m = longAlphaNum.exec(text)) !== null) {
    const val = m[1];
    // Filter out common false positives (dates, zip codes, etc.)
    if (!/^\d+$/.test(val) && val.length >= 8) {
      longMatches.push(val);
    }
  }
  
  // 6. Search for vehicle description context
  const vehicleContext = [];
  const contextPatterns = [
    /(?:veículo|veiculo|vehicle|carro|automóvel|automobile)[\s\S]{0,200}?(?:chassis|vin|placa|plate)/gi,
    /(?:chassis|vin)[\s\S]{0,100}/gi,
    /(?:motor|engine)\s*(?:n[°ºo.]?\s*)?[:.]?\s*([A-Za-z0-9]{3,20})/gi,
  ];
  
  for (const pat of contextPatterns) {
    let cm;
    while ((cm = pat.exec(text)) !== null) {
      vehicleContext.push(cm[0].substring(0, 200));
    }
  }
  
  console.log(`  17-char VINs: ${vin17.length > 0 ? [...new Set(vin17)].join(', ') : 'none'}`);
  console.log(`  Chassis keyword: ${chassisMatches.length > 0 ? chassisMatches.join(', ') : 'none'}`);
  console.log(`  VIN keyword: ${vinKeyMatches.length > 0 ? vinKeyMatches.join(', ') : 'none'}`);
  console.log(`  Plates: ${plates.length > 0 ? [...new Set(plates)].join(', ') : 'none'}`);
  console.log(`  Long alphanums (potential chassis): ${[...new Set(longMatches)].slice(0, 10).join(', ')}`);
  
  if (vehicleContext.length > 0) {
    console.log(`  Vehicle context snippets:`);
    for (const ctx of vehicleContext.slice(0, 5)) {
      console.log(`    "${ctx.trim()}"`);
    }
  }
  
  // Print the section around "chassis" or "veículo" for manual inspection
  const searchTerms = ['chassis', 'vin ', 'veículo', 'veiculo', 'vehicle', 'motor n'];
  for (const term of searchTerms) {
    const idx = text.toLowerCase().indexOf(term);
    if (idx >= 0) {
      const snippet = text.substring(Math.max(0, idx - 50), idx + 200);
      console.log(`  Context around "${term}": ...${snippet}...`);
      break;
    }
  }
}
