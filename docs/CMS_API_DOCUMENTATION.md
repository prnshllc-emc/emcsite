# CMS Content API — Documentation

## Overview

The **Enviando Meu Carro** website runs on a custom Node.js (Express + tRPC) stack. The CMS Content API provides RESTful endpoints for managing articles, categories, media, navigation, and SEO metatags programmatically.

**Platform**: Custom Node.js API (Express 4 + Drizzle ORM + MySQL/TiDB)
**Base URL**: `https://enviandomeucarro.com/api/cms`
**Alternative domains**: `https://enviandomeucarro.manus.space/api/cms`
**Authentication**: API Key (header-based)

---

## Authentication

All requests require an API key sent via one of these methods:

| Method | Header | Example |
|--------|--------|---------|
| Custom header | `x-cms-api-key` | `x-cms-api-key: cms_xxxxx` |
| Bearer token | `Authorization` | `Authorization: Bearer cms_xxxxx` |

The API key is stored as the environment variable `CMS_API_KEY` on the server.

**Error responses:**
- `401` — Invalid or missing API key
- `503` — API key not configured on server

---

## Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| **ARTICLES** | | |
| `GET` | `/articles` | List articles (paginated, filterable) |
| `GET` | `/articles/:idOrSlug` | Get single article by ID or slug |
| `POST` | `/articles` | Create new article |
| `PUT` | `/articles/:idOrSlug` | Update article by ID or slug |
| `DELETE` | `/articles/:id` | Soft-delete article |
| `POST` | `/articles/bulk` | Bulk create/update articles |
| `PATCH` | `/articles/:idOrSlug/publish` | Publish a draft article |
| `PATCH` | `/articles/:idOrSlug/archive` | Archive an article |
| **CATEGORIES** | | |
| `GET` | `/categories` | List all categories (with article counts) |
| `GET` | `/categories/:idOrSlug` | Get single category |
| `POST` | `/categories` | Create category |
| `PUT` | `/categories/:id` | Update category |
| `DELETE` | `/categories/:id` | Delete category (fails if has articles) |
| `POST` | `/categories/bulk` | Bulk create/update categories |
| **MEDIA** | | |
| `GET` | `/media` | List media files (paginated) |
| `POST` | `/media` | Upload media file (multipart/form-data) |
| `POST` | `/media/url` | Upload media from external URL |
| `DELETE` | `/media/:id` | Delete media file |
| **NAVIGATION** | | |
| `GET` | `/navigation` | List nav items (filterable by location) |
| `POST` | `/navigation` | Create nav item |
| `PUT` | `/navigation/:id` | Update nav item |
| `DELETE` | `/navigation/:id` | Delete nav item |
| **SEO** | | |
| `PUT` | `/seo/:idOrSlug` | Update SEO metatags for an article |
| **HEALTH** | | |
| `GET` | `/health` | Health check with content counts |

---

## Detailed Endpoint Documentation

### ARTICLES

#### `GET /articles` — List Articles

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |
| `status` | string | — | Filter by status: `draft`, `published`, `archived` |
| `categoryId` | integer | — | Filter by category ID |
| `search` | string | — | Search in article titles |

**Example request:**
```bash
curl -X GET "https://enviandomeucarro.com/api/cms/articles?status=published&limit=10" \
  -H "x-cms-api-key: YOUR_API_KEY"
```

**Example response:**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "como-importar-veiculo-dos-eua",
      "title": "Como Importar um Veículo dos EUA para o Brasil",
      "description": "Guia completo sobre importação...",
      "content": "<p>Conteúdo completo do artigo em HTML...</p>",
      "categoryId": 2,
      "status": "published",
      "author": "Equipe EMC",
      "readTime": "8 min",
      "tags": ["importação", "EUA", "veículos"],
      "featuredImage": "https://cdn.example.com/image.jpg",
      "metaTitle": "Como Importar Veículo dos EUA | EMC",
      "metaDescription": "Guia completo...",
      "metaKeywords": "importação veículos, EUA, Brasil",
      "canonicalUrl": null,
      "ogImage": null,
      "schemaType": "Article",
      "schemaData": null,
      "publishedAt": "2026-03-11T12:00:00.000Z",
      "createdAt": "2026-03-11T12:00:00.000Z",
      "updatedAt": "2026-03-11T12:00:00.000Z",
      "deletedAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

#### `GET /articles/:idOrSlug` — Get Single Article

Accepts either numeric ID or slug string.

```bash
curl -X GET "https://enviandomeucarro.com/api/cms/articles/como-importar-veiculo-dos-eua" \
  -H "x-cms-api-key: YOUR_API_KEY"
```

---

#### `POST /articles` — Create Article

**Request body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | **Yes** | URL-friendly slug (unique) |
| `title` | string | **Yes** | Article title (max 500 chars) |
| `description` | string | No | Short description/excerpt |
| `content` | string | No | Full article content (HTML or Markdown) |
| `categoryId` | integer | No | Category ID |
| `status` | enum | No | `draft` (default), `published`, `archived` |
| `author` | string | No | Author name |
| `readTime` | string | No | Estimated read time (e.g., "8 min") |
| `tags` | string[] | No | Array of tag strings |
| `featuredImage` | string | No | URL to featured image |
| `metaTitle` | string | No | SEO title (max 120 chars) |
| `metaDescription` | string | No | SEO description (max 320 chars) |
| `metaKeywords` | string | No | SEO keywords (max 500 chars) |
| `canonicalUrl` | string | No | Canonical URL |
| `ogImage` | string | No | Open Graph image URL |
| `publishedAt` | datetime | No | ISO 8601 datetime string |
| `schemaType` | string | No | JSON-LD schema type (e.g., "Article") |
| `schemaData` | string | No | JSON-LD schema data (JSON string) |

**Example request:**
```bash
curl -X POST "https://enviandomeucarro.com/api/cms/articles" \
  -H "x-cms-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "como-importar-veiculo-dos-eua",
    "title": "Como Importar um Veículo dos EUA para o Brasil",
    "description": "Guia completo sobre importação de veículos americanos",
    "content": "<h2>Introdução</h2><p>A importação de veículos...</p>",
    "categoryId": 2,
    "status": "draft",
    "author": "Equipe EMC",
    "readTime": "8 min",
    "tags": ["importação", "EUA", "veículos"],
    "metaTitle": "Como Importar Veículo dos EUA | Enviando Meu Carro",
    "metaDescription": "Guia completo sobre como importar um veículo dos Estados Unidos para o Brasil. Custos, documentos e prazos."
  }'
```

**Response:** `201 Created` with the created article.

---

#### `PUT /articles/:idOrSlug` — Update Article

Same fields as create, all optional. Accepts ID or slug.

```bash
curl -X PUT "https://enviandomeucarro.com/api/cms/articles/como-importar-veiculo-dos-eua" \
  -H "x-cms-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Guia Atualizado: Como Importar Veículo dos EUA",
    "content": "<h2>Introdução Atualizada</h2>...",
    "status": "published"
  }'
```

---

#### `DELETE /articles/:id` — Soft Delete Article

Soft-deletes (sets `deletedAt` timestamp). Article can be recovered.

```bash
curl -X DELETE "https://enviandomeucarro.com/api/cms/articles/15" \
  -H "x-cms-api-key: YOUR_API_KEY"
```

---

#### `POST /articles/bulk` — Bulk Create/Update

Send an array of article objects. If slug exists, updates; otherwise creates.

```bash
curl -X POST "https://enviandomeucarro.com/api/cms/articles/bulk" \
  -H "x-cms-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {"slug": "artigo-1", "title": "Artigo 1", "status": "draft"},
    {"slug": "artigo-2", "title": "Artigo 2", "status": "published"}
  ]'
```

**Response:**
```json
{
  "data": [
    {"slug": "artigo-1", "action": "created", "id": 10},
    {"slug": "artigo-2", "action": "updated", "id": 5}
  ],
  "total": 2
}
```

---

#### `PATCH /articles/:idOrSlug/publish` — Publish Article

Sets status to `published` and `publishedAt` if not already set.

```bash
curl -X PATCH "https://enviandomeucarro.com/api/cms/articles/como-importar-veiculo-dos-eua/publish" \
  -H "x-cms-api-key: YOUR_API_KEY"
```

---

#### `PATCH /articles/:idOrSlug/archive` — Archive Article

```bash
curl -X PATCH "https://enviandomeucarro.com/api/cms/articles/artigo-antigo/archive" \
  -H "x-cms-api-key: YOUR_API_KEY"
```

---

### CATEGORIES

#### `GET /categories` — List Categories

Returns all categories with article counts.

```bash
curl -X GET "https://enviandomeucarro.com/api/cms/categories" \
  -H "x-cms-api-key: YOUR_API_KEY"
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "importacao",
      "label": "Importação",
      "description": "Artigos sobre importação de veículos",
      "icon": "Ship",
      "color": "blue",
      "sortOrder": 1,
      "isActive": true,
      "articleCount": 5,
      "createdAt": "2026-03-11T12:00:00.000Z"
    }
  ]
}
```

---

#### `POST /categories` — Create Category

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | **Yes** | URL-friendly slug (unique) |
| `label` | string | **Yes** | Display name |
| `description` | string | No | Category description |
| `icon` | string | No | Icon name (Lucide icon) |
| `color` | string | No | Color theme |
| `sortOrder` | integer | No | Display order |
| `isActive` | boolean | No | Whether category is active |

```bash
curl -X POST "https://enviandomeucarro.com/api/cms/categories" \
  -H "x-cms-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "regulamentacoes",
    "label": "Regulamentações",
    "description": "Leis e normas sobre transporte internacional",
    "icon": "Scale",
    "color": "purple",
    "sortOrder": 6
  }'
```

---

#### `POST /categories/bulk` — Bulk Create/Update

```bash
curl -X POST "https://enviandomeucarro.com/api/cms/categories/bulk" \
  -H "x-cms-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {"slug": "importacao", "label": "Importação", "icon": "Ship"},
    {"slug": "exportacao", "label": "Exportação", "icon": "PackageCheck"}
  ]'
```

---

### MEDIA

#### `POST /media` — Upload File

Use `multipart/form-data` with the file in the `file` field.

```bash
curl -X POST "https://enviandomeucarro.com/api/cms/media" \
  -H "x-cms-api-key: YOUR_API_KEY" \
  -F "file=@/path/to/image.jpg" \
  -F "altText=BMW 320i importada" \
  -F "caption=Veículo importado pela EMC"
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "fileName": "image.jpg",
    "fileUrl": "https://s3.amazonaws.com/bucket/cms/media/1710000000-abc123.jpg",
    "fileKey": "cms/media/1710000000-abc123.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 245000,
    "altText": "BMW 320i importada",
    "caption": "Veículo importado pela EMC",
    "width": null,
    "height": null,
    "createdAt": "2026-03-11T12:00:00.000Z"
  }
}
```

---

#### `POST /media/url` — Upload from URL

Download an image from a URL and store it in S3.

```bash
curl -X POST "https://enviandomeucarro.com/api/cms/media/url" \
  -H "x-cms-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/photo.jpg",
    "fileName": "photo.jpg",
    "altText": "Porto de Santos",
    "caption": "Terminal de veículos no Porto de Santos"
  }'
```

---

### NAVIGATION

#### `GET /navigation` — List Nav Items

| Parameter | Type | Description |
|-----------|------|-------------|
| `location` | string | Filter: `header`, `footer_services`, `footer_routes`, `footer_quick` |

```bash
curl -X GET "https://enviandomeucarro.com/api/cms/navigation?location=header" \
  -H "x-cms-api-key: YOUR_API_KEY"
```

---

#### `POST /navigation` — Create Nav Item

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `location` | enum | **Yes** | `header`, `footer_services`, `footer_routes`, `footer_quick` |
| `label` | string | **Yes** | Display text |
| `href` | string | **Yes** | Link URL or path |
| `sortOrder` | integer | No | Display order |
| `isActive` | boolean | No | Whether item is visible |
| `parentId` | integer | No | Parent nav item ID (for nesting) |

---

### SEO

#### `PUT /seo/:idOrSlug` — Update SEO Metatags

Update SEO-specific fields for an article without touching content.

| Field | Type | Description |
|-------|------|-------------|
| `metaTitle` | string | SEO title (max 120 chars) |
| `metaDescription` | string | Meta description (max 320 chars) |
| `metaKeywords` | string | Keywords (max 500 chars) |
| `canonicalUrl` | string | Canonical URL |
| `ogImage` | string | Open Graph image URL |
| `schemaType` | string | JSON-LD type (e.g., "Article", "HowTo") |
| `schemaData` | string | Full JSON-LD schema (as JSON string) |
| `slug` | string | Update the URL slug |

```bash
curl -X PUT "https://enviandomeucarro.com/api/cms/seo/como-importar-veiculo-dos-eua" \
  -H "x-cms-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "metaTitle": "Como Importar Veículo dos EUA para o Brasil em 2026",
    "metaDescription": "Guia atualizado com custos, documentos e prazos para importar veículos americanos.",
    "metaKeywords": "importar carro EUA, importação veículos Brasil, custos importação",
    "schemaType": "Article",
    "schemaData": "{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"Como Importar Veículo dos EUA\"}"
  }'
```

---

### HEALTH CHECK

#### `GET /health` — API Health Check

```bash
curl -X GET "https://enviandomeucarro.com/api/cms/health" \
  -H "x-cms-api-key: YOUR_API_KEY"
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-11T12:00:00.000Z",
  "counts": {
    "articles": 12,
    "categories": 6,
    "media": 25
  }
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Human-readable error message",
  "details": [...] // Only for validation errors (Zod)
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request / validation error |
| `401` | Invalid or missing API key |
| `404` | Resource not found |
| `409` | Conflict (duplicate slug, category has articles) |
| `500` | Internal server error |
| `503` | API key not configured |

---

## Content Guidelines for SEO/GEO

When creating articles via this API, follow these guidelines:

1. **Slug format**: Use lowercase, hyphen-separated Portuguese slugs (e.g., `como-importar-veiculo-dos-eua`)
2. **Content format**: HTML is preferred for rich formatting; the frontend renders it directly
3. **Meta title**: Max 60 chars for Google SERP display, max 120 chars stored
4. **Meta description**: 150-160 chars optimal for SERP snippets
5. **Tags**: Use Portuguese keywords relevant to the article topic
6. **Featured image**: Upload via `/media` first, then reference the returned URL
7. **Schema data**: Use JSON-LD format as a JSON string for structured data
8. **Categories**: Match existing categories by ID (use `GET /categories` to list)

### Existing Categories (Knowledge Center)

| Slug | Label | Description |
|------|-------|-------------|
| `transporte-de-veiculos` | Transporte de Veículos | Logística e frete marítimo |
| `importacao` | Importação | Processos de importação |
| `exportacao` | Exportação | Processos de exportação |
| `frete-internacional` | Frete Internacional | Custos e modalidades |
| `carros-classicos` | Carros Clássicos | Importação de clássicos |
| `regulamentacoes` | Regulamentações | Leis e normas |

---

## Recommended Workflow

1. **Test connection**: `GET /health`
2. **Seed categories**: `POST /categories/bulk`
3. **Create articles as drafts**: `POST /articles` with `status: "draft"`
4. **Upload images**: `POST /media` or `POST /media/url`
5. **Update article with images**: `PUT /articles/:slug` with `featuredImage` URL
6. **Set SEO metatags**: `PUT /seo/:slug`
7. **Publish when ready**: `PATCH /articles/:slug/publish`
8. **Update sitemap**: The sitemap at `/sitemap.xml` should be regenerated after new articles are published

---

## Rate Limits

No explicit rate limits are enforced, but please keep requests reasonable (< 60/minute) to avoid server strain.

---

## Frontend Integration

Articles created via this API are automatically available on the website at:
- **Knowledge Center**: `https://enviandomeucarro.com/centro-de-conhecimento`
- **Individual articles**: `https://enviandomeucarro.com/centro-de-conhecimento/:category/:slug`

The frontend fetches published articles from the database and renders them with proper SEO metatags, JSON-LD schema, and responsive layout.
