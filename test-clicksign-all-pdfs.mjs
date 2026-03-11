import 'dotenv/config';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';

const token = process.env.CLICKSIGN_API_TOKEN;
const tmpDir = '/tmp/clicksign-pdfs';
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

// Get all documents
const listRes = await fetch(`https://app.clicksign.com/api/v1/documents?access_token=${token}&page=1&per_page=20`);
const listData = await listRes.json();

console.log(`Total documents: ${listData.documents.length}\n`);

const results = [];

for (const doc of listData.documents) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Document: ${doc.filename}`);
  console.log(`Status: ${doc.status} | Key: ${doc.key}`);
  
  const dRes = await fetch(`https://app.clicksign.com/api/v1/documents/${doc.key}?access_token=${token}`);
  const dData = await dRes.json();
  const d = dData.document;
  
  // Get signers (filter out owner)
  const clients = d.signers?.filter(s => s.documentation !== '337.381.238-06' && s.name !== 'Frederico Junqueira') || [];
  console.log(`Clients from signers: ${clients.map(c => `${c.name} (CPF: ${c.documentation || 'N/A'})`).join(', ')}`);
  
  // Download PDF
  let pdfText = '';
  if (d.downloads?.original_file_url) {
    try {
      const pdfPath = `${tmpDir}/${doc.key}.pdf`;
      const pdfRes = await fetch(d.downloads.original_file_url);
      const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
      writeFileSync(pdfPath, pdfBuffer);
      
      const textPath = `${tmpDir}/${doc.key}.txt`;
      execSync(`pdftotext "${pdfPath}" "${textPath}" 2>/dev/null`);
      pdfText = readFileSync(textPath, 'utf8');
      
      // Normalize text: remove line breaks within words
      const normalizedText = pdfText.replace(/\n/g, ' ').replace(/\s+/g, ' ');
      
      // Extract VINs (17 alphanumeric, no I/O/Q)
      const vinRegex = /\b[A-HJ-NPR-Z0-9]{17}\b/gi;
      const vins = normalizedText.match(vinRegex) || [];
      const uniqueVins = [...new Set(vins.map(v => v.toUpperCase()))];
      
      // Also look for "chassis" keyword nearby
      const chassisRegex = /chassis\s*(?:n[°ºo]?\s*)?[:.]?\s*([A-HJ-NPR-Z0-9]{8,17})/gi;
      let chassisMatch;
      const chassisVins = [];
      while ((chassisMatch = chassisRegex.exec(normalizedText)) !== null) {
        chassisVins.push(chassisMatch[1].toUpperCase());
      }
      
      // Extract CPFs from text
      const cpfRegex = /\b(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-.\s]?\d{2})\b/g;
      const cpfs = normalizedText.match(cpfRegex) || [];
      const uniqueCpfs = [...new Set(cpfs)];
      
      // Extract vehicle info
      const vehiclePatterns = [
        /(?:veículo|veiculo|vehicle|carro|automóvel).*?(?:marca|make)?\s*[:.]?\s*([A-Z][a-zA-Z]+).*?(?:modelo|model)?\s*[:.]?\s*([A-Z][a-zA-Z0-9\s]+?).*?(?:ano|year)?\s*[:.]?\s*(\d{4})/gi,
        /(?:sedan|coupe|suv|pickup|hatch|wagon|van|truck|motorcycle|moto)\s+([A-Z][A-Za-z]+)[,\s]+(?:modelo\s+)?([A-Za-z0-9\s]+?)[,\s]+(?:ano\s+)?(\d{4})/gi,
        /(?:um|uma|one|a)\s+(?:veículo|veiculo|vehicle).*?([A-Z][A-Z]+)[,\s]+(?:modelo\s+)?([A-Za-z0-9\s]+?)[,\s]+(?:ano\s+)?(\d{4})/gi,
      ];
      
      console.log(`  VINs (17-char): ${uniqueVins.length > 0 ? uniqueVins.join(', ') : 'none'}`);
      console.log(`  Chassis keyword: ${chassisVins.length > 0 ? chassisVins.join(', ') : 'none'}`);
      console.log(`  CPFs in text: ${uniqueCpfs.join(', ')}`);
      
      // Look for specific vehicle description near "chassis" or "VIN"
      const vehicleDescRegex = /(?:especificamente|specifically)\s+(?:um[a]?\s+)?(.+?)(?:,\s*chassis|,\s*VIN|\.\s)/gi;
      let vDescMatch;
      while ((vDescMatch = vehicleDescRegex.exec(normalizedText)) !== null) {
        console.log(`  Vehicle desc: ${vDescMatch[1].trim()}`);
      }
      
      // Broader search: look for make/model/year patterns
      const makeModelYear = /([A-Z][A-Z]+)\s*,?\s*(?:modelo\s+|model\s+)?([A-Za-z0-9\s]+?)\s*,?\s*(?:ano\s+|year\s+)?(\d{4})/gi;
      let mmyMatch;
      const vehicles = [];
      while ((mmyMatch = makeModelYear.exec(normalizedText)) !== null) {
        const make = mmyMatch[1];
        const model = mmyMatch[2].trim();
        const year = mmyMatch[3];
        if (parseInt(year) >= 1900 && parseInt(year) <= 2030 && make.length >= 2) {
          vehicles.push({ make, model, year });
        }
      }
      if (vehicles.length > 0) {
        console.log(`  Vehicles found: ${vehicles.map(v => `${v.year} ${v.make} ${v.model}`).join(' | ')}`);
      }
      
      results.push({
        docKey: doc.key,
        filename: doc.filename,
        status: doc.status,
        clients: clients.map(c => ({
          name: c.name,
          cpf: c.documentation,
          email: c.email,
          phone: c.phone_number,
        })),
        vins: uniqueVins,
        chassisVins,
        cpfsInText: uniqueCpfs,
        vehicles,
      });
      
    } catch (e) {
      console.log(`  PDF error: ${e.message}`);
    }
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log('SUMMARY');
console.log(`${'='.repeat(60)}`);
for (const r of results) {
  console.log(`\n${r.filename} [${r.status}]`);
  console.log(`  Clients: ${r.clients.map(c => `${c.name} (${c.cpf || 'no CPF'})`).join(', ')}`);
  console.log(`  VINs: ${[...r.vins, ...r.chassisVins].join(', ') || 'none found'}`);
  console.log(`  CPFs in text: ${r.cpfsInText.join(', ')}`);
}

writeFileSync(`${tmpDir}/results.json`, JSON.stringify(results, null, 2));
console.log(`\nResults saved to ${tmpDir}/results.json`);
