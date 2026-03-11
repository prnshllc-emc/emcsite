import mysql from 'mysql2/promise';
import fs from 'fs';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const out = [];
function log(msg) { out.push(msg); console.log(msg); }

log('═══════════════════════════════════════════════════════════════');
log('  DIAGNÓSTICO COMPLETO — SISTEMA DE RASTREIO EMC');
log('  Data: ' + new Date().toISOString());
log('═══════════════════════════════════════════════════════════════');

// ── 1. BILLS OF LADING ──────────────────────────────────────────
log('\n┌─────────────────────────────────────────────────────────────┐');
log('│ 1. BILLS OF LADING                                         │');
log('└─────────────────────────────────────────────────────────────┘');
const [bls] = await conn.query('SELECT * FROM bills_of_lading ORDER BY id');
for (const bl of bls) {
  log(`\n  BL #${bl.id}: ${bl.bl_number}`);
  log(`    Status: ${bl.status}`);
  log(`    Tipo: ${bl.bl_type}`);
  log(`    Container: ${bl.container_number || 'N/A'}`);
  log(`    Origem: ${bl.origin_port || 'N/A'} → Destino: ${bl.destination_port || 'N/A'}`);
  log(`    Veículos (descrição): ${bl.vehicle_description || 'N/A'}`);
  log(`    Customer ID: ${bl.customer_id || 'NENHUM'}`);
  log(`    Vehicle ID (legacy): ${bl.vehicle_id || 'NENHUM'}`);
  log(`    Est. Partida: ${bl.estimated_departure || 'N/A'}`);
  log(`    Est. Chegada: ${bl.estimated_arrival || 'N/A'}`);
  log(`    Partida Real: ${bl.actual_departure || 'N/A'}`);
  log(`    Chegada Real: ${bl.actual_arrival || 'N/A'}`);
  log(`    Source Email: ${bl.source_email || 'N/A'}`);
  log(`    Criado: ${bl.created_at}`);
  log(`    Atualizado: ${bl.updated_at}`);
  
  // Check raw BL data
  if (bl.raw_bl_data) {
    try {
      const raw = JSON.parse(bl.raw_bl_data);
      log(`    Raw BL Data: shipper=${raw.shipper || 'N/A'}, consignee=${raw.consignee || 'N/A'}, vessel=${raw.vessel || 'N/A'}`);
    } catch { log(`    Raw BL Data: [parse error]`); }
  }
}

// ── 2. VEHICLES ──────────────────────────────────────────────────
log('\n┌─────────────────────────────────────────────────────────────┐');
log('│ 2. VEHICLES                                                 │');
log('└─────────────────────────────────────────────────────────────┘');
const [vehicles] = await conn.query('SELECT * FROM vehicles WHERE deleted_at IS NULL ORDER BY id');
for (const v of vehicles) {
  log(`\n  Vehicle #${v.id}: ${v.make} ${v.model} ${v.year || ''}`);
  log(`    VIN: ${v.vin}`);
  log(`    Customer ID: ${v.customer_id || 'NENHUM'}`);
  log(`    Cor: ${v.color || 'N/A'}`);
  log(`    Última reconciliação: ${v.last_reconciliation_attempt || 'NUNCA'}`);
  log(`    Criado: ${v.created_at}`);
}

// ── 3. BL_VEHICLES JUNCTION ─────────────────────────────────────
log('\n┌─────────────────────────────────────────────────────────────┐');
log('│ 3. BL ↔ VEHICLES (junction table)                          │');
log('└─────────────────────────────────────────────────────────────┘');
const [blVehicles] = await conn.query(`
  SELECT bv.*, v.vin, v.make, v.model, v.year, v.customer_id as v_customer_id,
         b.bl_number, b.status as bl_status
  FROM bl_vehicles bv
  LEFT JOIN vehicles v ON bv.vehicle_id = v.id
  LEFT JOIN bills_of_lading b ON bv.bl_id = b.id
  ORDER BY bv.bl_id, bv.position
`);
let currentBl = null;
for (const bv of blVehicles) {
  if (bv.bl_number !== currentBl) {
    currentBl = bv.bl_number;
    log(`\n  BL ${bv.bl_number} (ID:${bv.bl_id}, ${bv.bl_status}):`);
  }
  log(`    Pos ${bv.position}: Vehicle #${bv.vehicle_id} — ${bv.make} ${bv.model} ${bv.year || ''} (VIN: ${bv.vin})`);
  log(`      Junction customer_id: ${bv.customer_id || 'NENHUM'} | Vehicle customer_id: ${bv.v_customer_id || 'NENHUM'}`);
  log(`      Notes: ${bv.notes || 'N/A'}`);
}

// ── 4. CUSTOMERS ─────────────────────────────────────────────────
log('\n┌─────────────────────────────────────────────────────────────┐');
log('│ 4. CUSTOMERS                                                │');
log('└─────────────────────────────────────────────────────────────┘');
const [customers] = await conn.query('SELECT * FROM customers WHERE deleted_at IS NULL ORDER BY id');
for (const c of customers) {
  log(`\n  Customer #${c.id}: ${c.name}`);
  log(`    Status: ${c.status}`);
  log(`    Email: ${c.email || 'N/A'}`);
  log(`    Telefone: ${c.phone || 'N/A'}`);
  log(`    Tipo Operação: ${c.tipo_operacao || 'N/A'}`);
  log(`    Data Source: ${c.data_source}`);
  log(`    Clicksign Envelope ID: ${c.clicksign_envelope_id || 'NENHUM'}`);
  log(`    Clicksign Signer ID: ${c.clicksign_signer_id || 'NENHUM'}`);
  log(`    CPF (encrypted): ${c.cpf ? 'SIM (' + c.cpf.length + ' chars)' : 'NÃO'}`);
  log(`    CPF Hash: ${c.cpf_hash ? 'SIM' : 'NÃO'}`);
  log(`    Manual Overrides: ${c.manual_overrides || 'N/A'}`);
  log(`    Criado: ${c.created_at}`);
  
  // Check which vehicles belong to this customer
  const custVehicles = vehicles.filter(v => v.customer_id === c.id);
  if (custVehicles.length > 0) {
    log(`    Veículos vinculados: ${custVehicles.map(v => `#${v.id} ${v.make} ${v.model} (${v.vin})`).join(', ')}`);
  } else {
    log(`    Veículos vinculados: NENHUM`);
  }
  
  // Check which BLs link to this customer
  const custBls = bls.filter(b => b.customer_id === c.id);
  if (custBls.length > 0) {
    log(`    BLs vinculados (direto): ${custBls.map(b => b.bl_number).join(', ')}`);
  } else {
    log(`    BLs vinculados (direto): NENHUM`);
  }
  
  // Check bl_vehicles junction for this customer
  const custBlVehicles = blVehicles.filter(bv => bv.customer_id === c.id);
  if (custBlVehicles.length > 0) {
    log(`    BLs vinculados (via junction): ${custBlVehicles.map(bv => `${bv.bl_number} veh#${bv.vehicle_id}`).join(', ')}`);
  } else {
    log(`    BLs vinculados (via junction): NENHUM`);
  }
}

// ── 5. TRACKING CODES ────────────────────────────────────────────
log('\n┌─────────────────────────────────────────────────────────────┐');
log('│ 5. TRACKING CODES                                           │');
log('└─────────────────────────────────────────────────────────────┘');
const [trackingCodes] = await conn.query('SELECT * FROM tracking_codes ORDER BY id');
if (trackingCodes.length === 0) {
  log('  NENHUM código de rastreamento gerado.');
} else {
  for (const tc of trackingCodes) {
    log(`  Code: ${tc.code} | BL ID: ${tc.bl_id} | Customer ID: ${tc.customer_id} | Status: ${tc.status} | Expires: ${tc.expires_at}`);
  }
}

// ── 6. TRACKING HISTORY ──────────────────────────────────────────
log('\n┌─────────────────────────────────────────────────────────────┐');
log('│ 6. TRACKING HISTORY (events)                                │');
log('└─────────────────────────────────────────────────────────────┘');
const [trackingHistory] = await conn.query('SELECT * FROM tracking_history ORDER BY bl_id, event_date');
log(`  Total de eventos: ${trackingHistory.length}`);
currentBl = null;
for (const th of trackingHistory) {
  const blNum = bls.find(b => b.id === th.bl_id)?.bl_number || `ID:${th.bl_id}`;
  if (blNum !== currentBl) {
    currentBl = blNum;
    log(`\n  BL ${blNum}:`);
  }
  log(`    [${th.status}] ${th.description?.substring(0, 100)} | ${th.location || 'N/A'} | ${th.event_date || 'N/A'}`);
}

// ── 7. CLICKSIGN CONTRACTS (DB) ─────────────────────────────────
log('\n┌─────────────────────────────────────────────────────────────┐');
log('│ 7. CLICKSIGN CONTRACTS (tabela no banco)                    │');
log('└─────────────────────────────────────────────────────────────┘');
const [csContracts] = await conn.query('SELECT * FROM clicksign_contracts ORDER BY id');
if (csContracts.length === 0) {
  log('  NENHUM contrato sincronizado do Clicksign para o banco.');
} else {
  for (const cs of csContracts) {
    log(`  Envelope: ${cs.envelope_id} | Signer: ${cs.signer_name} | Status: ${cs.status} | Customer ID: ${cs.customer_id || 'NENHUM'}`);
  }
}

// ── 8. CLIENT INVITES ────────────────────────────────────────────
log('\n┌─────────────────────────────────────────────────────────────┐');
log('│ 8. CLIENT INVITES                                           │');
log('└─────────────────────────────────────────────────────────────┘');
const [invites] = await conn.query('SELECT * FROM client_invites ORDER BY id');
if (invites.length === 0) {
  log('  NENHUM convite de cliente criado.');
} else {
  for (const inv of invites) {
    log(`  #${inv.id} Email: ${inv.email} | Status: ${inv.status} | BL ID: ${inv.bl_id || 'N/A'} | Customer ID: ${inv.customer_id || 'N/A'} | Vehicle ID: ${inv.vehicle_id || 'N/A'}`);
  }
}

// ── 9. PROCESSED EMAILS ─────────────────────────────────────────
log('\n┌─────────────────────────────────────────────────────────────┐');
log('│ 9. PROCESSED EMAILS                                         │');
log('└─────────────────────────────────────────────────────────────┘');
const [emails] = await conn.query('SELECT * FROM processed_emails ORDER BY id');
if (emails.length === 0) {
  log('  NENHUM email processado registrado.');
} else {
  for (const em of emails) {
    log(`  #${em.id} Subject: ${em.subject} | From: ${em.sender} | Status: ${em.processing_status} | BL ID: ${em.bl_id || 'N/A'}`);
  }
}

// ── 10. AUDIT LOG ────────────────────────────────────────────────
log('\n┌─────────────────────────────────────────────────────────────┐');
log('│ 10. AUDIT LOG                                               │');
log('└─────────────────────────────────────────────────────────────┘');
const [auditLog] = await conn.query('SELECT * FROM audit_log ORDER BY id DESC LIMIT 20');
if (auditLog.length === 0) {
  log('  NENHUMA entrada no audit log.');
} else {
  for (const al of auditLog) {
    log(`  [${al.created_at}] ${al.action} ${al.entity} #${al.entity_id} | User: ${al.user_id || 'system'}`);
  }
}

// ── 11. ORPHAN CHECK ─────────────────────────────────────────────
log('\n┌─────────────────────────────────────────────────────────────┐');
log('│ 11. INTEGRITY CHECKS                                        │');
log('└─────────────────────────────────────────────────────────────┘');

// Vehicles not linked to any BL
const linkedVehicleIds = new Set(blVehicles.map(bv => bv.vehicle_id));
const orphanVehicles = vehicles.filter(v => !linkedVehicleIds.has(v.id));
log(`\n  Veículos sem BL: ${orphanVehicles.length}`);
for (const v of orphanVehicles) {
  log(`    #${v.id} ${v.make} ${v.model} (${v.vin}) — Customer: ${v.customer_id || 'NENHUM'}`);
}

// Customers not linked to any BL (neither directly nor via junction)
const blCustomerIds = new Set(bls.filter(b => b.customer_id).map(b => b.customer_id));
const junctionCustomerIds = new Set(blVehicles.filter(bv => bv.customer_id).map(bv => bv.customer_id));
const vehicleCustomerIds = new Set(vehicles.filter(v => v.customer_id).map(v => v.customer_id));
const allLinkedCustomerIds = new Set([...blCustomerIds, ...junctionCustomerIds]);
const orphanCustomers = customers.filter(c => !allLinkedCustomerIds.has(c.id));
log(`\n  Clientes sem BL vinculado: ${orphanCustomers.length}`);
for (const c of orphanCustomers) {
  const hasVehicle = vehicleCustomerIds.has(c.id);
  log(`    #${c.id} ${c.name} — Tem veículo: ${hasVehicle ? 'SIM' : 'NÃO'} | Clicksign: ${c.clicksign_envelope_id || 'NENHUM'}`);
}

// BLs without customer
const blsNoCustomer = bls.filter(b => !b.customer_id);
log(`\n  BLs sem cliente vinculado: ${blsNoCustomer.length}`);
for (const bl of blsNoCustomer) {
  const blVehs = blVehicles.filter(bv => bv.bl_id === bl.id);
  const anyVehCustomer = blVehs.some(bv => bv.customer_id || bv.v_customer_id);
  log(`    ${bl.bl_number} — Veículos: ${blVehs.length} | Algum veículo com cliente: ${anyVehCustomer ? 'SIM' : 'NÃO'}`);
}

// Clicksign envelope IDs on customers vs actual Clicksign data
log(`\n  Clientes com Clicksign Envelope ID: ${customers.filter(c => c.clicksign_envelope_id).length}`);
for (const c of customers.filter(c => c.clicksign_envelope_id)) {
  const inDb = csContracts.find(cs => cs.envelope_id === c.clicksign_envelope_id);
  log(`    #${c.id} ${c.name} → Envelope: ${c.clicksign_envelope_id} | No banco clicksign_contracts: ${inDb ? 'SIM' : 'NÃO'}`);
}

log('\n═══════════════════════════════════════════════════════════════');
log('  FIM DO DIAGNÓSTICO');
log('═══════════════════════════════════════════════════════════════');

fs.writeFileSync('/home/ubuntu/diagnostic-output.txt', out.join('\n'));
await conn.end();
