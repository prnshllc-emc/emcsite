import mysql from 'mysql2/promise';
import fs from 'fs';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const [vehicles] = await conn.query('SELECT id, vin, make, model, year, customer_id FROM vehicles WHERE deleted_at IS NULL');
console.log(`=== ALL VEHICLES (${vehicles.length}) ===`);
for (const v of vehicles) {
  console.log(`  #${v.id} VIN:${v.vin} ${v.make} ${v.model} ${v.year || 'N/A'} cust:${v.customer_id || 'NONE'}`);
}

const [blVehicles] = await conn.query('SELECT * FROM bl_vehicles');
console.log(`\n=== BL_VEHICLES JUNCTION (${blVehicles.length}) ===`);
for (const bv of blVehicles) {
  console.log(`  blId:${bv.bl_id} vehId:${bv.vehicle_id} custId:${bv.customer_id || 'NONE'} pos:${bv.position}`);
}

const [bls] = await conn.query('SELECT id, bl_number, status, vehicle_description, customer_id, vehicle_id FROM bills_of_lading');
console.log(`\n=== ALL BLs (${bls.length}) ===`);
for (const bl of bls) {
  console.log(`  #${bl.id} ${bl.bl_number} [${bl.status}] desc:"${(bl.vehicle_description || '').substring(0,80)}" cust:${bl.customer_id || 'NONE'} veh:${bl.vehicle_id || 'NONE'}`);
}

const [customers] = await conn.query('SELECT id, name, status, data_source, clicksign_envelope_id FROM customers WHERE deleted_at IS NULL');
console.log(`\n=== ALL CUSTOMERS (${customers.length}) ===`);
for (const c of customers) {
  console.log(`  #${c.id} ${c.name} [${c.status}] src:${c.data_source} csEnv:${c.clicksign_envelope_id || 'NONE'}`);
}

const [csContracts] = await conn.query('SELECT * FROM clicksign_contracts');
console.log(`\n=== CLICKSIGN_CONTRACTS in DB (${csContracts.length}) ===`);

// Cross-reference Clicksign VINs with BL vehicles
const clicksignData = JSON.parse(fs.readFileSync('/home/ubuntu/clicksign-vins.json', 'utf8'));
const vinsFromClicksign = [];
for (const doc of clicksignData) {
  if (doc.extractedVins && doc.extractedVins.length > 0) {
    for (const vin of doc.extractedVins) {
      vinsFromClicksign.push({ vin, signerName: doc.signerName, signerCpf: doc.signerCpf, signerEmail: doc.signerEmail, filename: doc.filename, envelopeKey: doc.key });
    }
  }
}

console.log(`\n=== CLICKSIGN VINs vs DB VEHICLES (${vinsFromClicksign.length} VINs extracted) ===`);
for (const cv of vinsFromClicksign) {
  const match = vehicles.find(v => v.vin === cv.vin);
  const blMatch = match ? blVehicles.find(bv => bv.vehicle_id === match.id) : null;
  const blInfo = blMatch ? bls.find(bl => bl.id === blMatch.bl_id) : null;
  
  console.log(`  VIN:${cv.vin} Signer:${cv.signerName} CPF:${cv.signerCpf || 'N/A'}`);
  if (match) {
    console.log(`    → MATCH vehicle #${match.id} (${match.make} ${match.model})`);
    if (blInfo) {
      console.log(`    → In BL #${blInfo.id} ${blInfo.bl_number} [${blInfo.status}]`);
    } else {
      console.log(`    → Vehicle exists but NOT linked to any BL`);
    }
  } else {
    console.log(`    → NO MATCH in vehicles table (historical/completed contract)`);
  }
}

// Summary
console.log(`\n=== SUMMARY ===`);
console.log(`Vehicles in DB: ${vehicles.length}`);
console.log(`Vehicles linked to BLs: ${blVehicles.length}`);
console.log(`Vehicles with customer: ${vehicles.filter(v => v.customer_id).length}`);
console.log(`Vehicles without customer: ${vehicles.filter(v => !v.customer_id).length}`);
console.log(`BLs total: ${bls.length}`);
console.log(`BLs with customer: ${bls.filter(b => b.customer_id).length}`);
console.log(`BLs without customer: ${bls.filter(b => !b.customer_id).length}`);
console.log(`Customers total: ${customers.length}`);
console.log(`Clicksign contracts in DB: ${csContracts.length}`);
console.log(`Clicksign VINs extracted from PDFs: ${vinsFromClicksign.length}`);
const matchedVins = vinsFromClicksign.filter(cv => vehicles.find(v => v.vin === cv.vin));
console.log(`Clicksign VINs matching DB vehicles: ${matchedVins.length}`);

await conn.end();
