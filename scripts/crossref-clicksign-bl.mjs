import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// 1. Get all BL vehicles with VINs
const [blVehicles] = await conn.query(`
  SELECT bv.bl_id, bv.vehicle_id, bv.customer_id as junc_customer_id,
         v.vin, v.make, v.model, v.year, v.customer_id as veh_customer_id,
         b.bl_number, b.status as bl_status, b.vehicle_description
  FROM bl_vehicles bv
  JOIN vehicles v ON bv.vehicle_id = v.id
  JOIN bills_of_lading b ON bv.bl_id = b.id
  ORDER BY bv.bl_id
`);

// 2. Get all customers
const [customers] = await conn.query(`
  SELECT id, name, clicksign_envelope_id, clicksign_signer_id, status, data_source
  FROM customers ORDER BY id
`);

// 3. Get Simas's vehicles
const [simasVehicles] = await conn.query(`
  SELECT id, vin, make, model, year FROM vehicles WHERE customer_id = 1
`);

// 4. Extract VINs from all Clicksign PDFs
const pdfDir = '/home/ubuntu/clicksign-pdfs';
const pdfVins = {};
if (fs.existsSync(pdfDir)) {
  const pdfs = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));
  for (const pdf of pdfs) {
    const envelopeId = pdf.replace('.pdf', '');
    try {
      const text = execSync(`pdftotext "${path.join(pdfDir, pdf)}" - 2>/dev/null`, { encoding: 'utf8' });
      // Extract VIN-like patterns
      const vins = [...new Set(text.match(/[A-HJ-NPR-Z0-9]{17}|[A-Z]{1,2}\d{5,8}/gi) || [])];
      pdfVins[envelopeId] = { vins, textSnippet: text.substring(0, 500) };
    } catch {
      pdfVins[envelopeId] = { vins: [], textSnippet: '' };
    }
  }
}

// 5. Build VIN lookup from BL vehicles
const blVinMap = {};
for (const v of blVehicles) {
  blVinMap[v.vin?.toUpperCase()] = v;
}

// OUTPUT
console.log('═══════════════════════════════════════════════════════════');
console.log('  CROSS-REFERENCE: CLICKSIGN PDFs ↔ BL VEHICLES ↔ CUSTOMERS');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('--- BL VEHICLES (12 veículos em 5 BLs) ---');
for (const v of blVehicles) {
  const custLink = v.junc_customer_id || v.veh_customer_id || 'NONE';
  console.log(`  BL ${v.bl_number} (${v.bl_status}) → ${v.make} ${v.model} ${v.year || ''} | VIN: ${v.vin} | Customer: ${custLink}`);
}

console.log('\n--- CUSTOMERS (7) ---');
for (const c of customers) {
  const hasEnvelope = c.clicksign_envelope_id ? 'YES' : 'NO';
  const pdfExists = c.clicksign_envelope_id && fs.existsSync(path.join(pdfDir, c.clicksign_envelope_id + '.pdf'));
  console.log(`  #${c.id} ${c.name} | Status: ${c.status} | Source: ${c.data_source} | Envelope: ${hasEnvelope} (${c.clicksign_envelope_id || '-'}) | PDF: ${pdfExists ? 'YES' : 'NO'}`);
}

console.log('\n--- SIMAS VEHICLES (not linked to any BL) ---');
for (const v of simasVehicles) {
  console.log(`  Vehicle #${v.id}: ${v.make} ${v.model} ${v.year || ''} | VIN: ${v.vin}`);
}

console.log('\n--- CLICKSIGN PDF → VIN EXTRACTION → BL MATCH ---');
const customerEnvMap = {};
for (const c of customers) {
  if (c.clicksign_envelope_id) customerEnvMap[c.clicksign_envelope_id] = c;
}

let matchCount = 0;
let noMatchCount = 0;

for (const [envId, data] of Object.entries(pdfVins)) {
  const customer = customerEnvMap[envId];
  const customerLabel = customer ? `★ ${customer.name} (#${customer.id})` : 'Unknown customer';
  
  if (data.vins.length === 0) {
    console.log(`  PDF ${envId} → No VINs found | ${customerLabel}`);
    continue;
  }
  
  const matches = [];
  for (const vin of data.vins) {
    const blMatch = blVinMap[vin.toUpperCase()];
    if (blMatch) {
      matches.push({ vin, bl: blMatch.bl_number, vehicle: `${blMatch.make} ${blMatch.model}` });
      matchCount++;
    }
  }
  
  if (matches.length > 0) {
    console.log(`  PDF ${envId} → ${customerLabel}`);
    for (const m of matches) {
      console.log(`    ✓ VIN ${m.vin} → BL ${m.bl} (${m.vehicle})`);
    }
  } else {
    console.log(`  PDF ${envId} → VINs: ${data.vins.join(', ')} → NO BL MATCH | ${customerLabel}`);
    noMatchCount++;
  }
}

console.log(`\n--- SUMMARY ---`);
console.log(`  VIN matches found: ${matchCount}`);
console.log(`  PDFs with VINs but no BL match: ${noMatchCount}`);

console.log('\n--- GAP ANALYSIS ---');
console.log('  BLs without customer:');
const blsWithCustomer = new Set();
for (const v of blVehicles) {
  if (v.junc_customer_id || v.veh_customer_id) {
    blsWithCustomer.add(v.bl_number);
  }
}
const allBls = [...new Set(blVehicles.map(v => v.bl_number))];
for (const bl of allBls) {
  if (!blsWithCustomer.has(bl)) {
    const vehicles = blVehicles.filter(v => v.bl_number === bl);
    console.log(`    ${bl}: ${vehicles.map(v => `${v.make} ${v.model} (${v.vin})`).join(', ')}`);
  }
}

console.log('\n  Customers without BL:');
const customersWithBl = new Set();
for (const v of blVehicles) {
  if (v.junc_customer_id) customersWithBl.add(v.junc_customer_id);
  if (v.veh_customer_id) customersWithBl.add(v.veh_customer_id);
}
// Also check direct customer_id on BLs
const [bls] = await conn.query('SELECT id, bl_number, customer_id FROM bills_of_lading');
for (const bl of bls) {
  if (bl.customer_id) customersWithBl.add(bl.customer_id);
}
for (const c of customers) {
  if (!customersWithBl.has(c.id)) {
    console.log(`    #${c.id} ${c.name} (${c.data_source}, envelope: ${c.clicksign_envelope_id || 'NONE'})`);
  }
}

console.log('\n  Clicksign contracts in DB:');
const [contracts] = await conn.query('SELECT COUNT(*) as cnt FROM clicksign_contracts');
console.log(`    ${contracts[0].cnt} contracts synced`);

console.log('\n  Tracking codes:');
const [codes] = await conn.query('SELECT COUNT(*) as cnt FROM tracking_codes');
console.log(`    ${codes[0].cnt} codes generated`);

await conn.end();
