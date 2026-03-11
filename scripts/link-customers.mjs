import 'dotenv/config';
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// 1. Fix BMW VIN: WBADA → WBABA
console.log('=== Step 1: Fix BMW VIN ===');
const [vinCheck] = await conn.execute("SELECT id, vin FROM vehicles WHERE id = 1");
console.log('Current VIN for vehicle 1:', vinCheck[0]?.vin);

if (vinCheck[0]?.vin !== 'WBABA110X0EB56026') {
  await conn.execute("UPDATE vehicles SET vin = 'WBABA110X0EB56026', make = 'BMW', model = '320i Series 3 E30', year = 1992 WHERE id = 1");
  console.log('VIN corrected to WBABA110X0EB56026, year updated to 1992 (from contract)');
} else {
  // Still update make/model/year from contract
  await conn.execute("UPDATE vehicles SET make = 'BMW', model = '320i Series 3 E30', year = 1992 WHERE id = 1");
  console.log('VIN already correct, updated model/year from contract');
}

// Also update the BL vehicle_description to match
await conn.execute("UPDATE bills_of_lading SET vehicle_description = '1992 BMW 320i Series 3 E30 - VIN: WBABA110X0EB56026' WHERE id = 1");
console.log('BL #1 description updated');

// 2. Link Fabricio (customer_id:7) to vehicle 1 (BMW) and BL 1 (MAEU266193682)
console.log('\n=== Step 2: Link Fabricio to BMW & BL ===');
await conn.execute("UPDATE vehicles SET customer_id = 7 WHERE id = 1");
await conn.execute("UPDATE bills_of_lading SET customer_id = 7 WHERE id = 1");
console.log('Fabricio (ID:7) linked to vehicle 1 and BL 1 (MAEU266193682)');

// 3. Update Fabricio's status to em_processo (vehicle is in transit)
await conn.execute("UPDATE customers SET status = 'em_processo' WHERE id = 7");
console.log('Fabricio status updated to em_processo (BL in_transit)');

// 4. André Simas (customer_id:1) — vehicles 30011 (210716) and 30012 (1FTEX15H6MKA92716) already linked
console.log('\n=== Step 3: Verify Simas vehicles ===');
const [simasVehicles] = await conn.execute("SELECT id, vin, customer_id FROM vehicles WHERE customer_id = 1");
console.log('Simas vehicles:', simasVehicles.map(v => `${v.vin} (ID:${v.id})`).join(', '));

// 5. Verify final state
console.log('\n=== Final State ===');
const [finalBLs] = await conn.execute("SELECT bl.id, bl.bl_number, bl.customer_id, c.name as customer_name, bl.status FROM bills_of_lading bl LEFT JOIN customers c ON bl.customer_id = c.id WHERE bl.deleted_at IS NULL ORDER BY bl.id");
for (const bl of finalBLs) {
  console.log(`BL ${bl.bl_number} → Customer: ${bl.customer_name || 'NOT LINKED'} | Status: ${bl.status}`);
}

const [finalVehicles] = await conn.execute("SELECT v.id, v.vin, v.customer_id, c.name as customer_name FROM vehicles v LEFT JOIN customers c ON v.customer_id = c.id WHERE v.deleted_at IS NULL AND v.customer_id IS NOT NULL ORDER BY v.id");
console.log('\nLinked vehicles:');
for (const v of finalVehicles) {
  console.log(`  VIN ${v.vin} → ${v.customer_name}`);
}

await conn.end();
