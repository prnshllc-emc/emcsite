/**
 * Grand OS Public API Client
 *
 * Replaces tRPC calls with direct fetch to the Grand OS REST API.
 * The Grand OS is the backend that provides CMS, newsletter, and vehicle photos.
 *
 * Base URL: https://emc-grand-os-production.up.railway.app
 * CORS: * (open)
 * Rate limits: 60 req/min (CMS), 30 req/min (photos)
 */

const API_BASE =
  import.meta.env.VITE_GRAND_OS_API_URL ||
  "https://emc-grand-os-production.up.railway.app";

/* ─── Types ─────────────────────────────────────────────── */

export interface CmsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string; // only on single article
  coverImageUrl: string | null;
  categoryId: number | null;
  tags: string[];
  author: string;
  publishedAt: string;
  updatedAt?: string;
  readTime: number;
  viewCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords?: string[];
  schemaType?: string;
  schemaData?: Record<string, unknown>;
}

export interface CmsCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
}

export interface ArticlesResponse {
  articles: CmsArticle[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface VehiclePhotoSlot {
  id: number;
  slotKey: string;
  label: string;
  required: boolean;
  sortOrder: number;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  uploadedAt: string | null;
  aiClassification: string | null;
}

export interface VehicleAlbum {
  id: number;
  token: string;
  customerName: string;
  vehicleDescription: string;
  status: string;
  slots: VehiclePhotoSlot[];
  createdAt: string;
  confirmedAt: string | null;
}

/* ─── CMS API ───────────────────────────────────────────── */

export async function getArticles(params?: {
  limit?: number;
  offset?: number;
  category?: string;
  search?: string;
}): Promise<ArticlesResponse> {
  const url = new URL(`${API_BASE}/api/public/cms/articles`);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.offset) url.searchParams.set("offset", String(params.offset));
  if (params?.category) url.searchParams.set("category", params.category);
  if (params?.search) url.searchParams.set("search", params.search);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`CMS API error: ${res.status}`);
  return res.json();
}

export async function getArticle(slug: string): Promise<CmsArticle | null> {
  const res = await fetch(`${API_BASE}/api/public/cms/articles/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`CMS API error: ${res.status}`);
  const data = await res.json();
  return data.article || data;
}

export async function getCategories(): Promise<CmsCategory[]> {
  const res = await fetch(`${API_BASE}/api/public/cms/categories`);
  if (!res.ok) throw new Error(`CMS API error: ${res.status}`);
  const data = await res.json();
  return data.categories || data;
}

export async function incrementArticleView(articleId: number): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/public/cms/articles/${articleId}/view`, {
      method: "POST",
    });
  } catch {
    // silently fail — view count is not critical
  }
}

/* ─── Newsletter API ────────────────────────────────────── */

export async function subscribeNewsletter(data: {
  email: string;
  name?: string;
  source?: string;
}): Promise<{ success: boolean; message?: string; alreadySubscribed?: boolean }> {
  const res = await fetch(`${API_BASE}/api/public/cms/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: data.email,
      name: data.name,
      source: data.source || "site",
    }),
  });
  return res.json();
}

export async function unsubscribeNewsletter(email: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/api/public/cms/newsletter/unsubscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

/* ─── Vehicle Photos API ────────────────────────────────── */

export async function getVehicleAlbum(token: string): Promise<VehicleAlbum | null> {
  const res = await fetch(`${API_BASE}/api/public/vehicle-photos/${encodeURIComponent(token)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Photos API error: ${res.status}`);
  return res.json();
}

export async function uploadVehiclePhoto(
  token: string,
  file: File,
  slotKey: string,
): Promise<{ success: boolean; photoUrl?: string }> {
  const formData = new FormData();
  formData.append("photo", file);
  formData.append("slotKey", slotKey);

  const res = await fetch(`${API_BASE}/api/public/vehicle-photos/${encodeURIComponent(token)}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload error: ${res.status}`);
  return res.json();
}

export async function uploadVehiclePhotosBatch(
  token: string,
  files: { file: File; slotKey: string }[],
): Promise<{ success: boolean; results?: Array<{ slotKey: string; photoUrl: string }> }> {
  const formData = new FormData();
  files.forEach(({ file, slotKey }, i) => {
    formData.append(`photos`, file);
    formData.append(`slotKeys`, slotKey);
  });

  const res = await fetch(`${API_BASE}/api/public/vehicle-photos/${encodeURIComponent(token)}/upload-batch`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Batch upload error: ${res.status}`);
  return res.json();
}

export async function reassignVehiclePhoto(
  token: string,
  photoId: number,
  newSlotKey: string,
): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/api/public/vehicle-photos/${encodeURIComponent(token)}/reassign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ photoId, newSlotKey }),
  });
  if (!res.ok) throw new Error(`Reassign error: ${res.status}`);
  return res.json();
}

export async function confirmVehicleAlbum(token: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/api/public/vehicle-photos/${encodeURIComponent(token)}/confirm`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Confirm error: ${res.status}`);
  return res.json();
}

/* ─── Sitemap ───────────────────────────────────────────── */

export function getSitemapUrl(baseUrl = "https://enviandomeucarro.com"): string {
  return `${API_BASE}/api/public/cms/sitemap.xml?baseUrl=${encodeURIComponent(baseUrl)}`;
}
