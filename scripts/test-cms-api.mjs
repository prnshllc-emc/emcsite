/**
 * Test script for CMS Content API
 * Tests all major endpoints: health, categories, articles, SEO
 */
import 'dotenv/config';

const BASE_URL = `http://localhost:${process.env.PORT || 3000}/api/cms`;
const API_KEY = process.env.CMS_API_KEY;

if (!API_KEY) {
  console.error('❌ CMS_API_KEY not set in environment');
  process.exit(1);
}

const headers = {
  'x-cms-api-key': API_KEY,
  'Content-Type': 'application/json',
};

async function test(name, fn) {
  try {
    const result = await fn();
    console.log(`✅ ${name}`, result ? JSON.stringify(result).slice(0, 200) : '');
  } catch (err) {
    console.error(`❌ ${name}:`, err.message);
  }
}

async function run() {
  console.log(`\n🔗 Testing CMS API at ${BASE_URL}\n`);

  // 1. Health check
  await test('GET /health', async () => {
    const res = await fetch(`${BASE_URL}/health`, { headers });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
    return await res.json();
  });

  // 2. Test auth rejection
  await test('GET /health (no key → 401)', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    return { status: res.status, message: 'Correctly rejected' };
  });

  // 3. Create a test category
  await test('POST /categories', async () => {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        slug: 'test-category',
        label: 'Test Category',
        description: 'Created by API test',
        icon: 'TestTube',
        sortOrder: 99,
      }),
    });
    if (!res.ok && res.status !== 409) throw new Error(`Status ${res.status}: ${await res.text()}`);
    return await res.json();
  });

  // 4. List categories
  await test('GET /categories', async () => {
    const res = await fetch(`${BASE_URL}/categories`, { headers });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  });

  // 5. Create a test article
  await test('POST /articles', async () => {
    const res = await fetch(`${BASE_URL}/articles`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        slug: 'test-article-api',
        title: 'Test Article via API',
        description: 'This article was created via the CMS API',
        content: '<h2>Test Content</h2><p>This is a test article created by the API test script.</p>',
        status: 'draft',
        author: 'API Test',
        readTime: '2 min',
        tags: ['test', 'api'],
        metaTitle: 'Test Article | EMC',
        metaDescription: 'Test article created via CMS API',
      }),
    });
    if (!res.ok && res.status !== 409) throw new Error(`Status ${res.status}: ${await res.text()}`);
    return await res.json();
  });

  // 6. Get article by slug
  await test('GET /articles/test-article-api', async () => {
    const res = await fetch(`${BASE_URL}/articles/test-article-api`, { headers });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  });

  // 7. Update article
  await test('PUT /articles/test-article-api', async () => {
    const res = await fetch(`${BASE_URL}/articles/test-article-api`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        title: 'Updated Test Article via API',
        content: '<h2>Updated</h2><p>Content was updated via PUT.</p>',
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
    return await res.json();
  });

  // 8. Update SEO
  await test('PUT /seo/test-article-api', async () => {
    const res = await fetch(`${BASE_URL}/seo/test-article-api`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        metaTitle: 'Updated SEO Title | EMC',
        metaDescription: 'Updated meta description for test article',
        metaKeywords: 'test, api, seo',
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
    return await res.json();
  });

  // 9. Publish article
  await test('PATCH /articles/test-article-api/publish', async () => {
    const res = await fetch(`${BASE_URL}/articles/test-article-api/publish`, {
      method: 'PATCH',
      headers,
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
    return await res.json();
  });

  // 10. List articles
  await test('GET /articles?status=published', async () => {
    const res = await fetch(`${BASE_URL}/articles?status=published&limit=5`, { headers });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  });

  // 11. Cleanup: soft-delete test article
  await test('DELETE /articles/test-article-api (cleanup)', async () => {
    // First get the article to find its ID
    const getRes = await fetch(`${BASE_URL}/articles/test-article-api`, { headers });
    if (!getRes.ok) return { message: 'Article already deleted or not found' };
    const { data } = await getRes.json();
    const res = await fetch(`${BASE_URL}/articles/${data.id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  });

  // 12. Cleanup: delete test category
  await test('DELETE /categories/test-category (cleanup)', async () => {
    const getRes = await fetch(`${BASE_URL}/categories/test-category`, { headers });
    if (!getRes.ok) return { message: 'Category already deleted or not found' };
    const { data } = await getRes.json();
    const res = await fetch(`${BASE_URL}/categories/${data.id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error(`Status ${res.status}: ${await res.text()}`);
    return await res.json();
  });

  console.log('\n✅ All CMS API tests completed!\n');
}

run().catch(console.error);
