/**
 * CMS tRPC Router — Public endpoints for frontend to consume articles.
 * These are read-only public procedures (no auth required).
 *
 * The frontend Knowledge Center uses these endpoints to display articles.
 * Articles with status "published" show full content; "draft" articles
 * show metadata only (title, description) with a "content coming soon" placeholder.
 */
import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";
import { getDb } from "../../db";
import {
  cmsArticles,
  cmsCategories,
} from "../../../drizzle/schema";
import { eq, and, isNull, desc, like, sql, asc, or } from "drizzle-orm";

export const cmsRouter = router({
  /** List articles (published + draft) with pagination and filters.
   *  Draft articles are included so the Knowledge Center can show stubs. */
  listArticles: publicProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(50),
        categorySlug: z.string().optional(),
        search: z.string().optional(),
        publishedOnly: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { articles: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } };

      const { page, limit } = input;
      const offset = (page - 1) * limit;

      // Resolve category ID from slug if provided
      let categoryId: number | undefined;
      if (input.categorySlug) {
        const [cat] = await db
          .select({ id: cmsCategories.id })
          .from(cmsCategories)
          .where(eq(cmsCategories.slug, input.categorySlug))
          .limit(1);
        categoryId = cat?.id;
        if (!categoryId) return { articles: [], pagination: { page, limit, total: 0, totalPages: 0 } };
      }

      const conditions = [
        isNull(cmsArticles.deletedAt),
      ];

      // By default include published + draft (so stubs show up); exclude archived
      if (input.publishedOnly) {
        conditions.push(eq(cmsArticles.status, "published"));
      } else {
        conditions.push(or(eq(cmsArticles.status, "published"), eq(cmsArticles.status, "draft"))!);
      }

      if (categoryId) conditions.push(eq(cmsArticles.categoryId, categoryId));
      if (input.search) {
        const q = `%${input.search}%`;
        conditions.push(
          or(
            like(cmsArticles.title, q),
            like(cmsArticles.description, q),
            like(cmsArticles.tags, q)
          )!
        );
      }

      const [articles, countResult] = await Promise.all([
        db
          .select()
          .from(cmsArticles)
          .where(and(...conditions))
          .orderBy(desc(cmsArticles.publishedAt), desc(cmsArticles.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(cmsArticles)
          .where(and(...conditions)),
      ]);

      const total = countResult[0]?.count ?? 0;

      // Get category slugs for each article
      const catIds = Array.from(new Set(articles.map(a => a.categoryId).filter(Boolean)));
      let catSlugMap = new Map<number, string>();
      if (catIds.length > 0) {
        const cats = await db.select({ id: cmsCategories.id, slug: cmsCategories.slug }).from(cmsCategories);
        catSlugMap = new Map(cats.map(c => [c.id, c.slug]));
      }

      return {
        articles: articles.map((a) => ({
          id: a.id,
          slug: a.slug,
          title: a.title,
          description: a.description,
          content: a.status === "published" ? a.content : null, // Only send content for published
          author: a.author,
          readTime: a.readTime,
          tags: a.tags ? JSON.parse(a.tags) : [],
          featuredImage: a.featuredImage,
          categoryId: a.categoryId,
          categorySlug: a.categoryId ? catSlugMap.get(a.categoryId) ?? null : null,
          status: a.status,
          publishedAt: a.publishedAt,
          createdAt: a.createdAt,
          metaTitle: a.metaTitle,
          metaDescription: a.metaDescription,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  /** Get a single article by slug (published or draft) */
  getArticle: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [article] = await db
        .select()
        .from(cmsArticles)
        .where(
          and(
            eq(cmsArticles.slug, input.slug),
            or(eq(cmsArticles.status, "published"), eq(cmsArticles.status, "draft")),
            isNull(cmsArticles.deletedAt)
          )
        )
        .limit(1);

      if (!article) return null;

      // Get category slug
      let categorySlug: string | null = null;
      if (article.categoryId) {
        const [cat] = await db
          .select({ slug: cmsCategories.slug })
          .from(cmsCategories)
          .where(eq(cmsCategories.id, article.categoryId))
          .limit(1);
        categorySlug = cat?.slug ?? null;
      }

      return {
        ...article,
        categorySlug,
        tags: article.tags ? JSON.parse(article.tags) : [],
        schemaData: article.schemaData ? JSON.parse(article.schemaData) : null,
        // Only send full content for published articles
        content: article.status === "published" ? article.content : null,
      };
    }),

  /** List all active categories with article counts (published + draft) */
  listCategories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const categories = await db
      .select()
      .from(cmsCategories)
      .where(eq(cmsCategories.isActive, true))
      .orderBy(asc(cmsCategories.sortOrder));

    // Count all non-deleted, non-archived articles per category
    const counts = await db
      .select({
        categoryId: cmsArticles.categoryId,
        count: sql<number>`count(*)`,
      })
      .from(cmsArticles)
      .where(
        and(
          or(eq(cmsArticles.status, "published"), eq(cmsArticles.status, "draft")),
          isNull(cmsArticles.deletedAt)
        )
      )
      .groupBy(cmsArticles.categoryId);

    const countMap = new Map(counts.map((c) => [c.categoryId, c.count]));

    return categories.map((cat) => ({
      ...cat,
      articleCount: countMap.get(cat.id) ?? 0,
    }));
  }),
});
