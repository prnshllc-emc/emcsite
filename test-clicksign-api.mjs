import 'dotenv/config';

const token = process.env.CLICKSIGN_API_TOKEN;
console.log('Token present:', !!token);
console.log('Token length:', token?.length);

// Test the Clicksign API v1 - list documents
const res = await fetch(`https://app.clicksign.com/api/v1/documents?access_token=${token}&page=1&per_page=3`);
const data = await res.json();

console.log('\n=== API Response ===');
console.log('Top-level keys:', Object.keys(data));

if (data.documents) {
  console.log('Total documents:', data.documents.length);
  for (const doc of data.documents) {
    console.log('\n--- Document ---');
    console.log('Keys:', Object.keys(doc));
    console.log('Key:', doc.key);
    console.log('Filename:', doc.filename);
    console.log('Status:', doc.status);
    console.log('Created:', doc.created_at);
    console.log('Updated:', doc.updated_at);
    if (doc.template) console.log('Template:', JSON.stringify(doc.template).substring(0, 500));
    if (doc.signers) {
      console.log('Signers:', doc.signers.length);
      for (const s of doc.signers) {
        console.log('  Signer keys:', Object.keys(s));
        console.log('  Name:', s.name);
        console.log('  Email:', s.email);
        console.log('  Documentation:', s.documentation);
        console.log('  Phone:', s.phone_number);
        console.log('  Sign as:', s.sign_as);
      }
    }
  }
}

if (data.page_info) {
  console.log('\nPage info:', JSON.stringify(data.page_info));
}

// Also try the v1 document details for the first document
if (data.documents && data.documents[0]) {
  const docKey = data.documents[0].key;
  console.log('\n=== Document Details for:', docKey, '===');
  const detailRes = await fetch(`https://app.clicksign.com/api/v1/documents/${docKey}?access_token=${token}`);
  const detail = await detailRes.json();
  console.log('Detail keys:', Object.keys(detail));
  if (detail.document) {
    const d = detail.document;
    console.log('Document keys:', Object.keys(d));
    console.log('Filename:', d.filename);
    console.log('Content base64 length:', d.content_base64?.length || 'N/A');
    console.log('Template:', d.template ? JSON.stringify(d.template).substring(0, 1000) : 'N/A');
    console.log('Signers count:', d.signers?.length || 0);
    if (d.signers) {
      for (const s of d.signers) {
        console.log('\n  --- Signer Detail ---');
        console.log('  Keys:', Object.keys(s));
        console.log('  Name:', s.name);
        console.log('  Email:', s.email);
        console.log('  Documentation:', s.documentation);
        console.log('  Phone:', s.phone_number);
        console.log('  Birthday:', s.birthday);
        console.log('  Has doc:', s.has_documentation);
        console.log('  Sign as:', s.sign_as);
        console.log('  Events:', s.events?.length || 0);
        if (s.events) {
          for (const e of s.events) {
            console.log('    Event:', e.name, e.occurred_at);
          }
        }
      }
    }
  }
}
