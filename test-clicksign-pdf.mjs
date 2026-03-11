import 'dotenv/config';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';

const token = process.env.CLICKSIGN_API_TOKEN;

// Get the first document detail to get the download URL
const docKey = '4e5e5e2c-7e42-4c2b-a7e2-c8f2e9b8e1d3'; // Henrique Baratella
const detailRes = await fetch(`https://app.clicksign.com/api/v1/documents/${docKey}?access_token=${token}`);

if (!detailRes.ok) {
  // Try another doc key - let's get the list first
  const listRes = await fetch(`https://app.clicksign.com/api/v1/documents?access_token=${token}&page=1&per_page=10`);
  const listData = await listRes.json();
  
  for (const doc of listData.documents.slice(0, 3)) {
    console.log(`\n=== Trying document: ${doc.filename} (${doc.key}) ===`);
    const dRes = await fetch(`https://app.clicksign.com/api/v1/documents/${doc.key}?access_token=${token}`);
    const dData = await dRes.json();
    const d = dData.document;
    
    if (d.downloads && d.downloads.original_file_url) {
      console.log('Download URL found');
      
      // Download the PDF
      const tmpDir = '/tmp/clicksign-pdfs';
      if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
      const pdfPath = `${tmpDir}/${doc.key}.pdf`;
      
      const pdfRes = await fetch(d.downloads.original_file_url);
      const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
      writeFileSync(pdfPath, pdfBuffer);
      console.log(`PDF downloaded: ${pdfPath} (${pdfBuffer.length} bytes)`);
      
      // Extract text using pdftotext
      try {
        const textPath = `${tmpDir}/${doc.key}.txt`;
        execSync(`pdftotext "${pdfPath}" "${textPath}" 2>/dev/null`);
        const text = readFileSync(textPath, 'utf8');
        console.log(`Text extracted: ${text.length} chars`);
        
        // Search for VIN patterns (17 alphanumeric chars, no I/O/Q)
        const vinRegex = /\b[A-HJ-NPR-Z0-9]{17}\b/gi;
        const vins = text.match(vinRegex);
        if (vins) {
          console.log('VINs found:', [...new Set(vins)]);
        } else {
          console.log('No 17-char VINs found');
        }
        
        // Also search for shorter chassis patterns (Brazilian)
        const chassisRegex = /\b[A-Z]{2}\d{5,7}\b/gi;
        const chassis = text.match(chassisRegex);
        if (chassis) {
          console.log('Chassis patterns:', [...new Set(chassis)]);
        }
        
        // Print first 3000 chars of text for inspection
        console.log('\n--- PDF Text (first 3000 chars) ---');
        console.log(text.substring(0, 3000));
        console.log('--- END ---');
      } catch (e) {
        console.log('pdftotext error:', e.message);
      }
      
      break; // Only process first document for now
    }
  }
} else {
  const detail = await detailRes.json();
  console.log('Got detail for:', detail.document.filename);
}
