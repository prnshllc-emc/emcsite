import 'dotenv/config';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';

const token = process.env.CLICKSIGN_API_TOKEN;
const tmpDir = '/tmp/clicksign-pdfs';
const outputDir = '/tmp/clicksign-texts';
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

// Get ALL documents (paginated)
let allDocs = [];
let page = 1;
while (true) {
  const res = await fetch(`https://app.clicksign.com/api/v1/documents?access_token=${token}&page=${page}&per_page=30`);
  const data = await res.json();
  allDocs = [...allDocs, ...data.documents];
  if (!data.page_info?.next_page) break;
  page++;
}

console.log(`Total documents found: ${allDocs.length}\n`);

// For each document, get full details including signers and download PDF
const fullReport = [];

for (const doc of allDocs) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`DOCUMENT: ${doc.filename}`);
  console.log(`STATUS: ${doc.status} | KEY: ${doc.key}`);
  console.log(`CREATED: ${doc.created_at} | UPDATED: ${doc.updated_at}`);
  
  // Get full details
  const dRes = await fetch(`https://app.clicksign.com/api/v1/documents/${doc.key}?access_token=${token}`);
  const dData = await dRes.json();
  const d = dData.document;
  
  // Print ALL structured data from Clicksign API
  console.log(`\n--- CLICKSIGN STRUCTURED DATA ---`);
  console.log(`Filename: ${d.filename}`);
  console.log(`Status: ${d.status}`);
  console.log(`Auto close: ${d.auto_close}`);
  console.log(`Locale: ${d.locale}`);
  console.log(`Metadata: ${JSON.stringify(d.metadata || {})}`);
  console.log(`Sequence enabled: ${d.sequence_enabled}`);
  console.log(`Remind interval: ${d.remind_interval}`);
  console.log(`Content type: ${d.content_name}`);
  
  // Print ALL signer data
  console.log(`\n--- SIGNERS (${d.signers?.length || 0}) ---`);
  for (const s of (d.signers || [])) {
    console.log(`  Name: ${s.name}`);
    console.log(`  Email: ${s.email}`);
    console.log(`  CPF/Doc: ${s.documentation || 'N/A'}`);
    console.log(`  Phone: ${s.phone_number || 'N/A'}`);
    console.log(`  Birthday: ${s.birthday || 'N/A'}`);
    console.log(`  Sign as: ${s.sign_as}`);
    console.log(`  Has signed: ${s.has_signed}`);
    console.log(`  Delivery: ${s.delivery}`);
    console.log(`  ---`);
  }
  
  // Print ALL available fields from the document object
  console.log(`\n--- ALL DOCUMENT FIELDS ---`);
  for (const [key, val] of Object.entries(d)) {
    if (['signers', 'downloads', 'events'].includes(key)) continue;
    const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (strVal.length < 200) {
      console.log(`  ${key}: ${strVal}`);
    }
  }
  
  // Check for template data or custom fields
  if (d.template) {
    console.log(`\n--- TEMPLATE DATA ---`);
    console.log(JSON.stringify(d.template, null, 2));
  }
  
  // Download and extract PDF text
  let pdfText = '';
  if (d.downloads?.original_file_url) {
    const pdfPath = `${tmpDir}/${doc.key}.pdf`;
    const textPath = `${outputDir}/${doc.key}.txt`;
    
    if (!existsSync(pdfPath)) {
      const pdfRes = await fetch(d.downloads.original_file_url);
      const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
      writeFileSync(pdfPath, pdfBuffer);
    }
    
    try {
      execSync(`pdftotext "${pdfPath}" "${textPath}" 2>/dev/null`);
      pdfText = readFileSync(textPath, 'utf8');
      
      // Save clean text
      const cleanText = pdfText.replace(/\f/g, '\n---PAGE BREAK---\n');
      writeFileSync(`${outputDir}/${doc.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}.txt`, cleanText);
      
      console.log(`\n--- PDF FULL TEXT (${pdfText.length} chars) ---`);
      console.log(pdfText);
      console.log(`--- END PDF TEXT ---`);
    } catch (e) {
      console.log(`PDF extraction failed: ${e.message}`);
    }
  } else {
    console.log(`No download URL available`);
  }
  
  fullReport.push({
    key: doc.key,
    filename: doc.filename,
    status: doc.status,
    signers: d.signers?.map(s => ({
      name: s.name,
      email: s.email,
      cpf: s.documentation,
      phone: s.phone_number,
      birthday: s.birthday,
      sign_as: s.sign_as,
      has_signed: s.has_signed,
    })),
    metadata: d.metadata,
    pdfTextLength: pdfText.length,
    allFields: Object.keys(d),
  });
}

writeFileSync(`${outputDir}/full-report.json`, JSON.stringify(fullReport, null, 2));
console.log(`\n\nFull report saved to ${outputDir}/full-report.json`);
console.log(`Individual text files saved to ${outputDir}/`);
