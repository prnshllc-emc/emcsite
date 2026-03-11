import 'dotenv/config';
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const issues = [];
const warnings = [];
const stats = {};

console.log('╔══════════════════════════════════════════════════╗');
console.log('║   DATABASE INTEGRITY & RELIABILITY AUDIT        ║');
console.log('║   Enviando Meu Carro — ' + new Date().toISOString().slice(0,10) + '              ║');
console.log('╚══════════════════════════════════════════════════╝\n');

// ─── 1. TABLE COUNTS ───
console.log('━━━ 1. TABLE COUNTS ━━━');
const tables = ['users', 'customers', 'vehicles', 'bills_of_lading', 'bl_vehicles', 'newsletter_subscribers', 'site_settings'];
for (const t of tables) {
  try {
    const [rows] = await conn.execute(`SELECT COUNT(*) as cnt FROM ${t}`);
    stats[t] = rows[0].cnt;
    console.log(`  ${t}: ${rows[0].cnt} rows`);
  } catch (e) {
    issues.push(`Table ${t} missing or inaccessible: ${e.message}`);
    console.log(`  ${t}: ❌ ERROR`);
  }
}

// ─── 2. CUSTOMER DATA INTEGRITY ───
console.log('\n━━━ 2. CUSTOMER DATA INTEGRITY ━━━');

// Check for customers without CPF
const [noCpf] = await conn.execute("SELECT id, name FROM customers WHERE cpf IS NULL OR cpf = '' AND deleted_at IS NULL");
if (noCpf.length > 0) {
  issues.push(`${noCpf.length} customers without CPF: ${noCpf.map(c => c.name).join(', ')}`);
  console.log(`  ❌ ${noCpf.length} customers without CPF`);
} else {
  console.log('  ✅ All customers have CPF (encrypted)');
}

// Check for duplicate customer names
const [dupes] = await conn.execute("SELECT name, COUNT(*) as cnt FROM customers WHERE deleted_at IS NULL GROUP BY name HAVING cnt > 1");
if (dupes.length > 0) {
  warnings.push(`Duplicate customer names: ${dupes.map(d => `${d.name} (${d.cnt}x)`).join(', ')}`);
  console.log(`  ⚠️  ${dupes.length} duplicate customer names`);
} else {
  console.log('  ✅ No duplicate customer names');
}

// Check customer status distribution
const [statusDist] = await conn.execute("SELECT status, COUNT(*) as cnt FROM customers WHERE deleted_at IS NULL GROUP BY status");
console.log('  Status distribution:');
for (const s of statusDist) {
  console.log(`    ${s.status}: ${s.cnt}`);
}

// ─── 3. VEHICLE DATA INTEGRITY ───
console.log('\n━━━ 3. VEHICLE DATA INTEGRITY ━━━');

// Check for duplicate VINs
const [dupVins] = await conn.execute("SELECT vin, COUNT(*) as cnt FROM vehicles WHERE deleted_at IS NULL GROUP BY vin HAVING cnt > 1");
if (dupVins.length > 0) {
  issues.push(`Duplicate VINs: ${dupVins.map(d => `${d.vin} (${d.cnt}x)`).join(', ')}`);
  console.log(`  ❌ ${dupVins.length} duplicate VINs`);
} else {
  console.log('  ✅ No duplicate VINs');
}

// Check vehicles without customer
const [orphanVehicles] = await conn.execute("SELECT id, vin, make, model FROM vehicles WHERE customer_id IS NULL AND deleted_at IS NULL");
if (orphanVehicles.length > 0) {
  warnings.push(`${orphanVehicles.length} vehicles without customer link`);
  console.log(`  ⚠️  ${orphanVehicles.length} vehicles without customer link:`);
  for (const v of orphanVehicles) {
    console.log(`    VIN: ${v.vin} (${v.make} ${v.model})`);
  }
} else {
  console.log('  ✅ All vehicles linked to customers');
}

// Check vehicles with customer
const [linkedVehicles] = await conn.execute("SELECT v.vin, c.name FROM vehicles v JOIN customers c ON v.customer_id = c.id WHERE v.deleted_at IS NULL");
console.log(`  ✅ ${linkedVehicles.length} vehicles linked to customers:`);
for (const v of linkedVehicles) {
  console.log(`    ${v.vin} → ${v.name}`);
}

// ─── 4. BL DATA INTEGRITY ───
console.log('\n━━━ 4. BL DATA INTEGRITY ━━━');

// Check BLs without customer
const [orphanBLs] = await conn.execute("SELECT id, bl_number, status FROM bills_of_lading WHERE customer_id IS NULL AND deleted_at IS NULL");
if (orphanBLs.length > 0) {
  warnings.push(`${orphanBLs.length} BLs without customer link`);
  console.log(`  ⚠️  ${orphanBLs.length} BLs without customer link:`);
  for (const bl of orphanBLs) {
    console.log(`    ${bl.bl_number} (${bl.status})`);
  }
}

// Check BLs with customer
const [linkedBLs] = await conn.execute("SELECT bl.bl_number, bl.status, c.name FROM bills_of_lading bl JOIN customers c ON bl.customer_id = c.id WHERE bl.deleted_at IS NULL");
console.log(`  ✅ ${linkedBLs.length} BLs linked to customers:`);
for (const bl of linkedBLs) {
  console.log(`    ${bl.bl_number} → ${bl.name} (${bl.status})`);
}

// Check BL-Vehicle junction integrity
const [junctions] = await conn.execute(`
  SELECT bv.bl_id, bv.vehicle_id, bl.bl_number, v.vin 
  FROM bl_vehicles bv 
  LEFT JOIN bills_of_lading bl ON bv.bl_id = bl.id 
  LEFT JOIN vehicles v ON bv.vehicle_id = v.id
`);
const brokenJunctions = junctions.filter(j => !j.bl_number || !j.vin);
if (brokenJunctions.length > 0) {
  issues.push(`${brokenJunctions.length} broken BL-Vehicle junction records`);
  console.log(`  ❌ ${brokenJunctions.length} broken junction records`);
} else {
  console.log(`  ✅ All ${junctions.length} BL-Vehicle junctions valid`);
}

// Check BL status distribution
const [blStatusDist] = await conn.execute("SELECT status, COUNT(*) as cnt FROM bills_of_lading WHERE deleted_at IS NULL GROUP BY status");
console.log('  BL status distribution:');
for (const s of blStatusDist) {
  console.log(`    ${s.status}: ${s.cnt}`);
}

// ─── 5. REFERENTIAL INTEGRITY ───
console.log('\n━━━ 5. REFERENTIAL INTEGRITY ━━━');

// Vehicles pointing to non-existent customers
const [badVehCust] = await conn.execute("SELECT v.id, v.vin, v.customer_id FROM vehicles v WHERE v.customer_id IS NOT NULL AND v.customer_id NOT IN (SELECT id FROM customers)");
if (badVehCust.length > 0) {
  issues.push(`${badVehCust.length} vehicles reference non-existent customers`);
  console.log(`  ❌ ${badVehCust.length} vehicles reference non-existent customers`);
} else {
  console.log('  ✅ All vehicle→customer references valid');
}

// BLs pointing to non-existent customers
const [badBlCust] = await conn.execute("SELECT bl.id, bl.bl_number, bl.customer_id FROM bills_of_lading bl WHERE bl.customer_id IS NOT NULL AND bl.customer_id NOT IN (SELECT id FROM customers)");
if (badBlCust.length > 0) {
  issues.push(`${badBlCust.length} BLs reference non-existent customers`);
  console.log(`  ❌ ${badBlCust.length} BLs reference non-existent customers`);
} else {
  console.log('  ✅ All BL→customer references valid');
}

// BLs pointing to non-existent vehicles
const [badBlVeh] = await conn.execute("SELECT bl.id, bl.bl_number, bl.vehicle_id FROM bills_of_lading bl WHERE bl.vehicle_id IS NOT NULL AND bl.vehicle_id NOT IN (SELECT id FROM vehicles)");
if (badBlVeh.length > 0) {
  issues.push(`${badBlVeh.length} BLs reference non-existent vehicles`);
  console.log(`  ❌ ${badBlVeh.length} BLs reference non-existent vehicles`);
} else {
  console.log('  ✅ All BL→vehicle references valid');
}

// ─── 6. ENCRYPTION INTEGRITY ───
console.log('\n━━━ 6. ENCRYPTION INTEGRITY ━━━');
const [encCheck] = await conn.execute("SELECT id, name, cpf, cpf_hash FROM customers WHERE deleted_at IS NULL");
let encOk = 0, encBad = 0;
for (const c of encCheck) {
  // Check CPF is encrypted (should contain colons for salt:iv:tag:cipher format)
  if (c.cpf && c.cpf.includes(':') && c.cpf_hash && c.cpf_hash.length === 64) {
    encOk++;
  } else {
    encBad++;
    issues.push(`Customer ${c.name} (ID:${c.id}) has invalid encryption format`);
  }
}
if (encBad === 0) {
  console.log(`  ✅ All ${encOk} customer CPFs properly encrypted (AES-256-GCM + HMAC-SHA256 hash)`);
} else {
  console.log(`  ❌ ${encBad} customers with invalid encryption`);
}

// ─── 7. NEWSLETTER SUBSCRIBERS ───
console.log('\n━━━ 7. NEWSLETTER SUBSCRIBERS ━━━');
const [nlStats] = await conn.execute("SELECT active, COUNT(*) as cnt FROM newsletter_subscribers GROUP BY active");
for (const s of nlStats) {
  console.log(`  ${s.active ? 'Active' : 'Inactive'}: ${s.cnt}`);
}

// ─── SUMMARY ───
console.log('\n╔══════════════════════════════════════════════════╗');
console.log('║   AUDIT SUMMARY                                 ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log(`  Total tables: ${tables.length}`);
console.log(`  Customers: ${stats.customers || 0} | Vehicles: ${stats.vehicles || 0} | BLs: ${stats.bills_of_lading || 0}`);
console.log(`  BL-Vehicle junctions: ${stats.bl_vehicles || 0}`);
console.log(`  Newsletter subscribers: ${stats.newsletter_subscribers || 0}`);
console.log(`\n  🔴 Critical issues: ${issues.length}`);
for (const i of issues) console.log(`    → ${i}`);
console.log(`  🟡 Warnings: ${warnings.length}`);
for (const w of warnings) console.log(`    → ${w}`);
console.log(`\n  Overall integrity: ${issues.length === 0 ? '✅ PASS' : '❌ ISSUES FOUND'}`);

await conn.end();
