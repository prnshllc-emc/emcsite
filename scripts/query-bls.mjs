import 'dotenv/config';
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

console.log('=== ALL BLs ===');
const [bls] = await conn.execute('SELECT id, bl_number, vehicle_description, container_number, status, customer_id, vehicle_id FROM bills_of_lading WHERE deleted_at IS NULL ORDER BY id');
for (const bl of bls) {
  console.log(`ID:${bl.id} | BL:${bl.bl_number} | Desc:${bl.vehicle_description} | Container:${bl.container_number} | Status:${bl.status} | CustID:${bl.customer_id} | VehID:${bl.vehicle_id}`);
}

console.log('\n=== ALL VEHICLES ===');
const [vehicles] = await conn.execute('SELECT id, vin, make, model, year, customer_id FROM vehicles WHERE deleted_at IS NULL ORDER BY id');
for (const v of vehicles) {
  console.log(`ID:${v.id} | VIN:${v.vin} | Make:${v.make} | Model:${v.model} | Year:${v.year} | CustID:${v.customer_id}`);
}

console.log('\n=== BL_VEHICLES junction ===');
const [junctions] = await conn.execute('SELECT * FROM bl_vehicles ORDER BY bl_id');
for (const j of junctions) {
  console.log(`BL_ID:${j.bl_id} | Vehicle_ID:${j.vehicle_id}`);
}

console.log('\n=== CUSTOMERS ===');
const [customers] = await conn.execute('SELECT id, name, status, tipo_operacao FROM customers WHERE deleted_at IS NULL ORDER BY id');
for (const c of customers) {
  console.log(`ID:${c.id} | Name:${c.name} | Status:${c.status} | Tipo:${c.tipo_operacao}`);
}

await conn.end();
