import { describe, it, expect } from "vitest";

/**
 * CMS tRPC Router Tests
 *
 * These tests call the CMS tRPC endpoints via HTTP to verify:
 * 1. listCategories returns seeded categories
 * 2. listArticles returns seeded articles with proper structure
 * 3. listArticles filters by categorySlug
 * 4. listArticles supports search
 * 5. getArticle returns a single article by slug
 * 6. getArticle returns null for non-existent slug
 *
 * Note: tRPC uses superjson transformer, so inputs must be wrapped
 * in { json: <value> } format for the query string.
 */

const BASE = `http://localhost:${process.env.PORT || 3000}/api/trpc`;

/** Helper: call a tRPC query via HTTP (superjson-encoded input) */
async function trpcQuery<T = unknown>(
  procedure: string,
  input?: unknown
): Promise<T> {
  // superjson transformer wraps input in { json: <value> }
  const url = input !== undefined
    ? `${BASE}/${procedure}?input=${encodeURIComponent(JSON.stringify({ json: input }))}`
    : `${BASE}/${procedure}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`tRPC ${procedure} returned ${res.status}: ${await res.text()}`);
  }
  const body = await res.json();
  // superjson response: { result: { data: { json: <value>, meta?: ... } } }
  const data = body?.result?.data;
  return (data?.json !== undefined ? data.json : data) as T;
}

describe("CMS tRPC Router", () => {
  // ── listCategories ──────────────────────────────────────────
  describe("cms.listCategories", () => {
    it("should return an array of categories", async () => {
      const categories = await trpcQuery<unknown[]>("cms.listCategories");
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThanOrEqual(6);
    });

    it("should include expected category fields", async () => {
      const categories = await trpcQuery<Record<string, unknown>[]>("cms.listCategories");
      const first = categories[0];
      expect(first).toHaveProperty("id");
      expect(first).toHaveProperty("slug");
      expect(first).toHaveProperty("label");
      expect(first).toHaveProperty("description");
      expect(first).toHaveProperty("articleCount");
      expect(typeof first.articleCount).toBe("number");
    });

    it("should include the 'importacao' category", async () => {
      const categories = await trpcQuery<{ slug: string }[]>("cms.listCategories");
      const importacao = categories.find((c) => c.slug === "importacao");
      expect(importacao).toBeDefined();
    });
  });

  // ── listArticles ────────────────────────────────────────────
  describe("cms.listArticles", () => {
    it("should return articles with pagination", async () => {
      const result = await trpcQuery<{
        articles: unknown[];
        pagination: { page: number; total: number };
      }>("cms.listArticles", { limit: 50 });
      expect(result).toHaveProperty("articles");
      expect(result).toHaveProperty("pagination");
      expect(Array.isArray(result.articles)).toBe(true);
      expect(result.articles.length).toBeGreaterThanOrEqual(1);
      expect(result.pagination.page).toBe(1);
    });

    it("should include expected article fields", async () => {
      const result = await trpcQuery<{
        articles: Record<string, unknown>[];
      }>("cms.listArticles", { limit: 1 });
      const article = result.articles[0];
      expect(article).toHaveProperty("id");
      expect(article).toHaveProperty("slug");
      expect(article).toHaveProperty("title");
      expect(article).toHaveProperty("description");
      expect(article).toHaveProperty("status");
      expect(article).toHaveProperty("categorySlug");
      expect(article).toHaveProperty("tags");
      expect(Array.isArray(article.tags)).toBe(true);
    });

    it("should filter articles by categorySlug", async () => {
      const result = await trpcQuery<{
        articles: { categorySlug: string | null }[];
      }>("cms.listArticles", { categorySlug: "importacao", limit: 50 });
      expect(result.articles.length).toBeGreaterThanOrEqual(1);
      for (const a of result.articles) {
        expect(a.categorySlug).toBe("importacao");
      }
    });

    it("should return empty for non-existent category", async () => {
      const result = await trpcQuery<{
        articles: unknown[];
        pagination: { total: number };
      }>("cms.listArticles", { categorySlug: "non-existent-slug", limit: 50 });
      expect(result.articles).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it("should support text search", async () => {
      const result = await trpcQuery<{
        articles: { title: string }[];
      }>("cms.listArticles", { search: "importação", limit: 50 });
      // At least one article should match (we seeded articles about importação)
      expect(result.articles.length).toBeGreaterThanOrEqual(1);
    });

    it("should not send content for draft articles", async () => {
      const result = await trpcQuery<{
        articles: { status: string; content: string | null }[];
      }>("cms.listArticles", { limit: 50 });
      const drafts = result.articles.filter((a) => a.status === "draft");
      for (const d of drafts) {
        expect(d.content).toBeNull();
      }
    });
  });

  // ── getArticle ──────────────────────────────────────────────
  describe("cms.getArticle", () => {
    it("should return an article by slug", async () => {
      // First get an article slug from the list
      const list = await trpcQuery<{
        articles: { slug: string }[];
      }>("cms.listArticles", { limit: 1 });
      const slug = list.articles[0]?.slug;
      expect(slug).toBeDefined();

      const article = await trpcQuery<Record<string, unknown>>(
        "cms.getArticle",
        { slug }
      );
      expect(article).not.toBeNull();
      expect(article).toHaveProperty("title");
      expect(article).toHaveProperty("slug", slug);
      expect(article).toHaveProperty("categorySlug");
    });

    it("should return null for non-existent slug", async () => {
      const article = await trpcQuery<unknown>(
        "cms.getArticle",
        { slug: "this-article-does-not-exist-xyz" }
      );
      expect(article).toBeNull();
    });
  });
});
