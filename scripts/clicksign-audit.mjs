import https from 'https';
import { config } from 'dotenv';
config();

const TOKEN = process.env.CLICKSIGN_API_TOKEN;
if (!TOKEN) { console.log('NO CLICKSIGN_API_TOKEN'); process.exit(1); }

function fetchJSON(path) {
  return new Promise((resolve, reject) => {
    const url = `https://app.clicksign.com${path}`;
    https.get(url, { timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { reject(new Error('Parse error: ' + data.substring(0,200))); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const customerEnvelopes = {
  'e5bc9207-58ba-4e95-a5c6-5501e18d893c': 'Paulo Sergio (#2)',
  'f7bc0a55-d667-4095-a1d7-8b5791977c55': 'Huber Mastelari (#3)',
  'ef95494b-f1fb-4441-83af-fdb98ed08f0a': 'Sandoval Gonçalves (#4)',
  '4b296c9a-97c0-4bb9-8eb2-529d691732c9': 'André Merino Teles (#5)',
  'c2cc2ba1-95a6-4e26-b54f-39e347967859': 'Roberto Nunes (#6)',
  '01e7c2e2-6809-442b-bccb-2dec20ff14ee': 'Fabricio Menezes (#7)',
};

console.log('Fetching envelopes...');
const envResp = await fetchJSON(`/api/v3/envelopes?access_token=${TOKEN}&page_size=100`);
const envelopes = envResp.data || [];
console.log(`Total envelopes: ${envelopes.length}\n`);

const results = [];

for (const env of envelopes) {
  const isOurCustomer = customerEnvelopes[env.id] || null;
  const marker = isOurCustomer ? ` ★★★ ${isOurCustomer}` : '';
  
  const entry = {
    id: env.id,
    name: env.attributes?.name || 'N/A',
    status: env.attributes?.status || 'N/A',
    created: env.attributes?.created_at || 'N/A',
    customer: isOurCustomer,
    signers: [],
    documents: []
  };
  
  try {
    await sleep(300); // rate limit
    const detail = await fetchJSON(`/api/v3/envelopes/${env.id}?access_token=${TOKEN}`);
    const signers = detail.included?.filter(i => i.type === 'signers') || [];
    for (const s of signers) {
      entry.signers.push({
        name: s.attributes?.name || 'N/A',
        cpf: s.attributes?.documentation || 'N/A',
        email: s.attributes?.email || 'N/A'
      });
    }
    const docs = detail.included?.filter(i => i.type === 'documents') || [];
    for (const d of docs) {
      entry.documents.push(d.attributes?.filename || 'N/A');
    }
  } catch (e) {
    entry.error = e.message;
  }
  
  results.push(entry);
  
  console.log(`${entry.status.padEnd(10)} | ${entry.name.substring(0,60).padEnd(60)}${marker}`);
  for (const s of entry.signers) {
    console.log(`           Signer: ${s.name} | CPF: ${s.cpf} | Email: ${s.email}`);
  }
  for (const d of entry.documents) {
    console.log(`           Doc: ${d}`);
  }
}

// Summary: our customers
console.log('\n\n═══ NOSSOS CLIENTES NO CLICKSIGN ═══');
for (const r of results.filter(r => r.customer)) {
  console.log(`\n${r.customer}`);
  console.log(`  Envelope: ${r.id}`);
  console.log(`  Contrato: ${r.name}`);
  console.log(`  Status: ${r.status}`);
  for (const s of r.signers) {
    console.log(`  Signer: ${s.name} | CPF: ${s.cpf} | Email: ${s.email}`);
  }
  for (const d of r.documents) {
    console.log(`  Doc: ${d}`);
  }
}

// Save full JSON
import fs from 'fs';
fs.writeFileSync('/home/ubuntu/clicksign-audit-results.json', JSON.stringify(results, null, 2));
console.log('\nSaved to /home/ubuntu/clicksign-audit-results.json');
