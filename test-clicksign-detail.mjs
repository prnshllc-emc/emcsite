import 'dotenv/config';

const token = process.env.CLICKSIGN_API_TOKEN;

// Get all documents first
const listRes = await fetch(`https://app.clicksign.com/api/v1/documents?access_token=${token}&page=1&per_page=20`);
const listData = await listRes.json();

console.log('Total documents:', listData.documents.length);
console.log('Page info:', JSON.stringify(listData.page_info));

// Get details for each document
for (const doc of listData.documents) {
  console.log('\n========================================');
  console.log('Document:', doc.filename);
  console.log('Status:', doc.status);
  console.log('Key:', doc.key);
  
  const detailRes = await fetch(`https://app.clicksign.com/api/v1/documents/${doc.key}?access_token=${token}`);
  const detail = await detailRes.json();
  const d = detail.document;
  
  // Check metadata
  if (d.metadata && Object.keys(d.metadata).length > 0) {
    console.log('Metadata:', JSON.stringify(d.metadata));
  }
  
  // Check template
  if (d.template) {
    console.log('Template:', JSON.stringify(d.template).substring(0, 500));
  }
  
  // Check downloads
  if (d.downloads) {
    console.log('Downloads keys:', Object.keys(d.downloads));
    if (d.downloads.original_file_url) {
      console.log('Original file URL:', d.downloads.original_file_url.substring(0, 100) + '...');
    }
  }
  
  // Signers (filter out Frederico)
  if (d.signers) {
    for (const s of d.signers) {
      const isOwner = s.documentation === '337.381.238-06' || s.name === 'Frederico Junqueira';
      console.log(`  Signer: ${s.name} | CPF: ${s.documentation} | Email: ${s.email} | Phone: ${s.phone_number} | ${isOwner ? '[OWNER]' : '[CLIENT]'}`);
    }
  }
  
  // Events
  if (d.events && d.events.length > 0) {
    console.log('  Events:', d.events.map(e => `${e.name} (${e.occurred_at})`).join(', '));
  }
}
