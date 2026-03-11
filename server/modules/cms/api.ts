/**
 * CMS Content API — REST endpoints for external content management.
 *
 * Authenticated via CMS_API_KEY (header: x-cms-api-key or Authorization: Bearer <key>).
 * Provides full CRUD for articles, categories, media, and navigation.
 *
 * All endpoints are mounted under /api/cms/* in Express.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { getDb } from "../../db";
import { storagePut } from "../../storage";
import {
  cmsArticles,
  cmsCategories,
  cmsMedia,
  cmsNavigation,
  type CmsArticle,
  type CmsCategory,
} from "../../../drizzle/schema";
import { eq, and, isNull, desc, asc, like, sql } from "drizzle-orm";
import { ENV } from "../../_core/env";
import multer from "multer";
import crypto from "crypto";

// ── Helper: get db or throw ─────────────────────────────────
async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

// ── API Key Authentication Middleware ────────────────────────
function requireCmsApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey =
    req.headers["x-cms-api-key"] ||
    req.headers["authorization"]?.replace("Bearer ", "");
  const expectedKey = ENV.cmsApiKey;

  if (!expectedKey) {
    res.status(503).json({ error: "CMS API key not configured on server." });
    return;
  }

  if (!apiKey || apiKey !== expectedKey) {
    res.status(401).json({ error: "Invalid or missing CMS API key." });
    return;
  }

  next();
}

// ── Multer for file uploads (memory storage) ────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ── Zod Schemas ─────────────────────────────────────────────

const ArticleCreateSchema = z.object({
  slug: z.string().min(1).max(256),
  title: z.string().min(1).max(500),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  categoryId: z.number().int().optional().nullable(),
  metaTitle: z.string().max(120).optional().nullable(),
  metaDescription: z.string().max(320).optional().nullable(),
  metaKeywords: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().max(500).optional().nullable(),
  ogImage: z.string().max(1000).optional().nullable(),
  author: z.string().max(255).optional().nullable(),
  readTime: z.string().max(20).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  featuredImage: z.string().max(1000).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  schemaType: z.string().max(50).optional().nullable(),
  schemaData: z.string().optional().nullable(),
});

const ArticleUpdateSchema = ArticleCreateSchema.partial();

const CategoryCreateSchema = z.object({
  slug: z.string().min(1).max(128),
  label: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const CategoryUpdateSchema = CategoryCreateSchema.partial();

const NavItemCreateSchema = z.object({
  location: z.enum(["header", "footer_services", "footer_routes", "footer_quick"]),
  label: z.string().min(1).max(128),
  href: z.string().min(1).max(500),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  parentId: z.number().int().optional().nullable(),
});

const NavItemUpdateSchema = NavItemCreateSchema.partial();

// ── Helper: paginated query ─────────────────────────────────
function getPagination(req: Request) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// ── Create CMS Router ───────────────────────────────────────
export function createCmsRouter(): Router {
  const cmsRouter = Router();
  cmsRouter.use(requireCmsApiKey);

  // ═══════════════════════════════════════════════════════════
  // ARTICLES
  // ═══════════════════════════════════════════════════════════

  // GET /api/cms/articles — List articles (paginated, filterable)
  cmsRouter.get("/articles", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const { page, limit, offset } = getPagination(req);
      const status = req.query.status as string | undefined;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const search = req.query.search as string | undefined;

      const conditions = [isNull(cmsArticles.deletedAt)];
      if (status) conditions.push(eq(cmsArticles.status, status as "draft" | "published" | "archived"));
      if (categoryId) conditions.push(eq(cmsArticles.categoryId, categoryId));
      if (search) conditions.push(like(cmsArticles.title, `%${search}%`));

      const [articles, countResult] = await Promise.all([
        db.select().from(cmsArticles).where(and(...conditions)).orderBy(desc(cmsArticles.updatedAt)).limit(limit).offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(cmsArticles).where(and(...conditions)),
      ]);

      const total = countResult[0]?.count ?? 0;
      res.json({
        data: articles.map(formatArticle),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      console.error("[CMS API] Error listing articles:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/cms/articles/:idOrSlug — Get single article
  cmsRouter.get("/articles/:idOrSlug", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const { idOrSlug } = req.params;
      const isId = /^\d+$/.test(idOrSlug);

      const [article] = await db
        .select().from(cmsArticles)
        .where(and(
          isId ? eq(cmsArticles.id, parseInt(idOrSlug)) : eq(cmsArticles.slug, idOrSlug),
          isNull(cmsArticles.deletedAt)
        ))
        .limit(1);

      if (!article) { res.status(404).json({ error: "Article not found" }); return; }
      res.json({ data: formatArticle(article) });
    } catch (error: any) {
      console.error("[CMS API] Error getting article:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/cms/articles — Create article
  cmsRouter.post("/articles", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const input = ArticleCreateSchema.parse(req.body);
      const insertData: any = {
        ...input,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : input.status === "published" ? new Date() : null,
      };

      const [result] = await db.insert(cmsArticles).values(insertData);
      const [created] = await db.select().from(cmsArticles).where(eq(cmsArticles.id, result.insertId));
      res.status(201).json({ data: formatArticle(created) });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else if (error.code === "ER_DUP_ENTRY") {
        res.status(409).json({ error: "Article with this slug already exists" });
      } else {
        console.error("[CMS API] Error creating article:", error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // PUT /api/cms/articles/:idOrSlug — Update article
  cmsRouter.put("/articles/:idOrSlug", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const { idOrSlug } = req.params;
      const isId = /^\d+$/.test(idOrSlug);
      const input = ArticleUpdateSchema.parse(req.body);
      const condition = isId ? eq(cmsArticles.id, parseInt(idOrSlug)) : eq(cmsArticles.slug, idOrSlug);

      const [existing] = await db.select().from(cmsArticles).where(and(condition, isNull(cmsArticles.deletedAt))).limit(1);
      if (!existing) { res.status(404).json({ error: "Article not found" }); return; }

      const updateData: any = { ...input };
      if (input.tags !== undefined) updateData.tags = input.tags ? JSON.stringify(input.tags) : null;
      if (input.publishedAt !== undefined) updateData.publishedAt = input.publishedAt ? new Date(input.publishedAt) : null;
      if (input.status === "published" && !existing.publishedAt && !input.publishedAt) {
        updateData.publishedAt = new Date();
      }

      await db.update(cmsArticles).set(updateData).where(eq(cmsArticles.id, existing.id));
      const [updated] = await db.select().from(cmsArticles).where(eq(cmsArticles.id, existing.id));
      res.json({ data: formatArticle(updated) });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("[CMS API] Error updating article:", error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // DELETE /api/cms/articles/:id — Soft delete article
  cmsRouter.delete("/articles/:id", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const id = parseInt(req.params.id);
      if (isNaN(id)) { res.status(400).json({ error: "Invalid article ID" }); return; }
      await db.update(cmsArticles).set({ deletedAt: new Date() }).where(eq(cmsArticles.id, id));
      res.json({ success: true, message: "Article soft-deleted" });
    } catch (error: any) {
      console.error("[CMS API] Error deleting article:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/cms/articles/bulk — Bulk create/update articles
  cmsRouter.post("/articles/bulk", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const articles = z.array(ArticleCreateSchema).parse(req.body);
      const results: { slug: string; action: string; id?: number; error?: string }[] = [];

      for (const input of articles) {
        try {
          const [existing] = await db.select().from(cmsArticles).where(eq(cmsArticles.slug, input.slug)).limit(1);
          const data: any = {
            ...input,
            tags: input.tags ? JSON.stringify(input.tags) : null,
            publishedAt: input.publishedAt ? new Date(input.publishedAt) : input.status === "published" ? new Date() : null,
          };

          if (existing) {
            await db.update(cmsArticles).set(data).where(eq(cmsArticles.id, existing.id));
            results.push({ slug: input.slug, action: "updated", id: existing.id });
          } else {
            const [result] = await db.insert(cmsArticles).values(data);
            results.push({ slug: input.slug, action: "created", id: result.insertId });
          }
        } catch (err: any) {
          results.push({ slug: input.slug, action: "error", error: err.message });
        }
      }
      res.json({ data: results, total: results.length });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("[CMS API] Error in bulk operation:", error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // PATCH /api/cms/articles/:idOrSlug/publish — Publish article
  cmsRouter.patch("/articles/:idOrSlug/publish", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const { idOrSlug } = req.params;
      const isId = /^\d+$/.test(idOrSlug);
      const condition = isId ? eq(cmsArticles.id, parseInt(idOrSlug)) : eq(cmsArticles.slug, idOrSlug);

      const [existing] = await db.select().from(cmsArticles).where(and(condition, isNull(cmsArticles.deletedAt))).limit(1);
      if (!existing) { res.status(404).json({ error: "Article not found" }); return; }

      await db.update(cmsArticles).set({ status: "published", publishedAt: existing.publishedAt || new Date() }).where(eq(cmsArticles.id, existing.id));
      const [updated] = await db.select().from(cmsArticles).where(eq(cmsArticles.id, existing.id));
      res.json({ data: formatArticle(updated) });
    } catch (error: any) {
      console.error("[CMS API] Error publishing article:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/cms/articles/:idOrSlug/archive — Archive article
  cmsRouter.patch("/articles/:idOrSlug/archive", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const { idOrSlug } = req.params;
      const isId = /^\d+$/.test(idOrSlug);
      const condition = isId ? eq(cmsArticles.id, parseInt(idOrSlug)) : eq(cmsArticles.slug, idOrSlug);
      await db.update(cmsArticles).set({ status: "archived" }).where(condition);
      res.json({ success: true, message: "Article archived" });
    } catch (error: any) {
      console.error("[CMS API] Error archiving article:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // CATEGORIES
  // ═══════════════════════════════════════════════════════════

  // GET /api/cms/categories — List all categories
  cmsRouter.get("/categories", async (_req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const categories = await db.select().from(cmsCategories).orderBy(asc(cmsCategories.sortOrder));

      const articleCounts = await db
        .select({ categoryId: cmsArticles.categoryId, count: sql<number>`count(*)` })
        .from(cmsArticles)
        .where(and(isNull(cmsArticles.deletedAt), eq(cmsArticles.status, "published")))
        .groupBy(cmsArticles.categoryId);

      const countMap = new Map(articleCounts.map((c: { categoryId: number | null; count: number }) => [c.categoryId, c.count]));

      res.json({
        data: categories.map((cat: CmsCategory) => ({
          ...cat,
          articleCount: countMap.get(cat.id) ?? 0,
        })),
      });
    } catch (error: any) {
      console.error("[CMS API] Error listing categories:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/cms/categories/:idOrSlug — Get single category
  cmsRouter.get("/categories/:idOrSlug", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const { idOrSlug } = req.params;
      const isId = /^\d+$/.test(idOrSlug);

      const [category] = await db.select().from(cmsCategories)
        .where(isId ? eq(cmsCategories.id, parseInt(idOrSlug)) : eq(cmsCategories.slug, idOrSlug))
        .limit(1);

      if (!category) { res.status(404).json({ error: "Category not found" }); return; }
      res.json({ data: category });
    } catch (error: any) {
      console.error("[CMS API] Error getting category:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/cms/categories — Create category
  cmsRouter.post("/categories", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const input = CategoryCreateSchema.parse(req.body);
      const [result] = await db.insert(cmsCategories).values(input);
      const [created] = await db.select().from(cmsCategories).where(eq(cmsCategories.id, result.insertId));
      res.status(201).json({ data: created });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else if (error.code === "ER_DUP_ENTRY") {
        res.status(409).json({ error: "Category with this slug already exists" });
      } else {
        console.error("[CMS API] Error creating category:", error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // PUT /api/cms/categories/:id — Update category
  cmsRouter.put("/categories/:id", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const id = parseInt(req.params.id);
      const input = CategoryUpdateSchema.parse(req.body);
      await db.update(cmsCategories).set(input).where(eq(cmsCategories.id, id));
      const [updated] = await db.select().from(cmsCategories).where(eq(cmsCategories.id, id));
      if (!updated) { res.status(404).json({ error: "Category not found" }); return; }
      res.json({ data: updated });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("[CMS API] Error updating category:", error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // DELETE /api/cms/categories/:id — Delete category
  cmsRouter.delete("/categories/:id", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const id = parseInt(req.params.id);

      const [articleCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(cmsArticles)
        .where(and(eq(cmsArticles.categoryId, id), isNull(cmsArticles.deletedAt)));

      if (articleCount && articleCount.count > 0) {
        res.status(409).json({
          error: "Cannot delete category with existing articles. Reassign or delete articles first.",
          articleCount: articleCount.count,
        });
        return;
      }

      await db.delete(cmsCategories).where(eq(cmsCategories.id, id));
      res.json({ success: true, message: "Category deleted" });
    } catch (error: any) {
      console.error("[CMS API] Error deleting category:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/cms/categories/bulk — Bulk create/update categories
  cmsRouter.post("/categories/bulk", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const categories = z.array(CategoryCreateSchema).parse(req.body);
      const results: { slug: string; action: string; id?: number; error?: string }[] = [];

      for (const input of categories) {
        try {
          const [existing] = await db.select().from(cmsCategories).where(eq(cmsCategories.slug, input.slug)).limit(1);
          if (existing) {
            await db.update(cmsCategories).set(input).where(eq(cmsCategories.id, existing.id));
            results.push({ slug: input.slug, action: "updated", id: existing.id });
          } else {
            const [result] = await db.insert(cmsCategories).values(input);
            results.push({ slug: input.slug, action: "created", id: result.insertId });
          }
        } catch (err: any) {
          results.push({ slug: input.slug, action: "error", error: err.message });
        }
      }
      res.json({ data: results, total: results.length });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("[CMS API] Error in bulk category operation:", error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // ═══════════════════════════════════════════════════════════
  // MEDIA
  // ═══════════════════════════════════════════════════════════

  // GET /api/cms/media — List media files
  cmsRouter.get("/media", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const { page, limit, offset } = getPagination(req);
      const mimeFilter = req.query.mimeType as string | undefined;

      const conditions: any[] = [];
      if (mimeFilter) conditions.push(like(cmsMedia.mimeType, `${mimeFilter}%`));
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [media, countResult] = await Promise.all([
        db.select().from(cmsMedia).where(whereClause).orderBy(desc(cmsMedia.createdAt)).limit(limit).offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(cmsMedia).where(whereClause),
      ]);

      const total = countResult[0]?.count ?? 0;
      res.json({
        data: media,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      console.error("[CMS API] Error listing media:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/cms/media — Upload media file
  cmsRouter.post("/media", upload.single("file"), async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const file = (req as any).file;
      if (!file) { res.status(400).json({ error: "No file uploaded. Use multipart/form-data with 'file' field." }); return; }

      const altText = req.body.altText || null;
      const caption = req.body.caption || null;
      const suffix = crypto.randomBytes(6).toString("hex");
      const ext = file.originalname.split(".").pop() || "bin";
      const fileKey = `cms/media/${Date.now()}-${suffix}.${ext}`;

      const { url } = await storagePut(fileKey, file.buffer, file.mimetype);

      const [result] = await db.insert(cmsMedia).values({
        fileName: file.originalname,
        fileUrl: url,
        fileKey,
        mimeType: file.mimetype,
        fileSize: file.size,
        altText,
        caption,
        width: req.body.width ? parseInt(req.body.width) : null,
        height: req.body.height ? parseInt(req.body.height) : null,
      });

      const [created] = await db.select().from(cmsMedia).where(eq(cmsMedia.id, result.insertId));
      res.status(201).json({ data: created });
    } catch (error: any) {
      console.error("[CMS API] Error uploading media:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/cms/media/url — Upload media from URL
  cmsRouter.post("/media/url", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const { url: sourceUrl, fileName, altText, caption } = req.body;
      if (!sourceUrl) { res.status(400).json({ error: "Missing 'url' field" }); return; }

      const response = await fetch(sourceUrl);
      if (!response.ok) { res.status(400).json({ error: `Failed to fetch URL: ${response.statusText}` }); return; }

      const buffer = Buffer.from(await response.arrayBuffer());
      const mimeType = response.headers.get("content-type") || "application/octet-stream";
      const suffix = crypto.randomBytes(6).toString("hex");
      const ext = (fileName || sourceUrl).split(".").pop()?.split("?")[0] || "bin";
      const fileKey = `cms/media/${Date.now()}-${suffix}.${ext}`;

      const { url } = await storagePut(fileKey, buffer, mimeType);

      const [result] = await db.insert(cmsMedia).values({
        fileName: fileName || sourceUrl.split("/").pop() || "file",
        fileUrl: url, fileKey, mimeType,
        fileSize: buffer.length,
        altText: altText || null,
        caption: caption || null,
      });

      const [created] = await db.select().from(cmsMedia).where(eq(cmsMedia.id, result.insertId));
      res.status(201).json({ data: created });
    } catch (error: any) {
      console.error("[CMS API] Error uploading media from URL:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/cms/media/:id — Delete media
  cmsRouter.delete("/media/:id", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const id = parseInt(req.params.id);
      await db.delete(cmsMedia).where(eq(cmsMedia.id, id));
      res.json({ success: true, message: "Media deleted" });
    } catch (error: any) {
      console.error("[CMS API] Error deleting media:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════

  // GET /api/cms/navigation — List nav items (optionally filtered by location)
  cmsRouter.get("/navigation", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const location = req.query.location as string | undefined;
      const conditions: any[] = [];
      if (location) conditions.push(eq(cmsNavigation.location, location as any));
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db.select().from(cmsNavigation).where(whereClause).orderBy(asc(cmsNavigation.location), asc(cmsNavigation.sortOrder));
      res.json({ data: items });
    } catch (error: any) {
      console.error("[CMS API] Error listing navigation:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/cms/navigation — Create nav item
  cmsRouter.post("/navigation", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const input = NavItemCreateSchema.parse(req.body);
      const [result] = await db.insert(cmsNavigation).values(input);
      const [created] = await db.select().from(cmsNavigation).where(eq(cmsNavigation.id, result.insertId));
      res.status(201).json({ data: created });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("[CMS API] Error creating nav item:", error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // PUT /api/cms/navigation/:id — Update nav item
  cmsRouter.put("/navigation/:id", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const id = parseInt(req.params.id);
      const input = NavItemUpdateSchema.parse(req.body);
      await db.update(cmsNavigation).set(input).where(eq(cmsNavigation.id, id));
      const [updated] = await db.select().from(cmsNavigation).where(eq(cmsNavigation.id, id));
      if (!updated) { res.status(404).json({ error: "Nav item not found" }); return; }
      res.json({ data: updated });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("[CMS API] Error updating nav item:", error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // DELETE /api/cms/navigation/:id — Delete nav item
  cmsRouter.delete("/navigation/:id", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const id = parseInt(req.params.id);
      await db.delete(cmsNavigation).where(eq(cmsNavigation.id, id));
      res.json({ success: true, message: "Nav item deleted" });
    } catch (error: any) {
      console.error("[CMS API] Error deleting nav item:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════
  // SEO / METATAGS
  // ═══════════════════════════════════════════════════════════

  // PUT /api/cms/seo/:articleIdOrSlug — Update SEO fields for an article
  cmsRouter.put("/seo/:idOrSlug", async (req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const { idOrSlug } = req.params;
      const isId = /^\d+$/.test(idOrSlug);
      const condition = isId ? eq(cmsArticles.id, parseInt(idOrSlug)) : eq(cmsArticles.slug, idOrSlug);

      const seoFields = z.object({
        metaTitle: z.string().max(120).optional().nullable(),
        metaDescription: z.string().max(320).optional().nullable(),
        metaKeywords: z.string().max(500).optional().nullable(),
        canonicalUrl: z.string().max(500).optional().nullable(),
        ogImage: z.string().max(1000).optional().nullable(),
        schemaType: z.string().max(50).optional().nullable(),
        schemaData: z.string().optional().nullable(),
        slug: z.string().max(256).optional(),
      }).parse(req.body);

      await db.update(cmsArticles).set(seoFields).where(condition);
      const [updated] = await db.select().from(cmsArticles).where(condition).limit(1);
      if (!updated) { res.status(404).json({ error: "Article not found" }); return; }
      res.json({ data: formatArticle(updated) });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ error: "Validation error", details: error.errors });
      } else {
        console.error("[CMS API] Error updating SEO:", error);
        res.status(500).json({ error: error.message });
      }
    }
  });

  // ═══════════════════════════════════════════════════════════
  // HEALTH CHECK
  // ═══════════════════════════════════════════════════════════

  cmsRouter.get("/health", async (_req: Request, res: Response) => {
    try {
      const db = await requireDb();
      const [articleCount] = await db.select({ count: sql<number>`count(*)` }).from(cmsArticles).where(isNull(cmsArticles.deletedAt));
      const [categoryCount] = await db.select({ count: sql<number>`count(*)` }).from(cmsCategories);
      const [mediaCount] = await db.select({ count: sql<number>`count(*)` }).from(cmsMedia);

      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        counts: {
          articles: articleCount?.count ?? 0,
          categories: categoryCount?.count ?? 0,
          media: mediaCount?.count ?? 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({ status: "error", error: error.message });
    }
  });

  return cmsRouter;
}

// ── Format article for API response ─────────────────────────
function formatArticle(article: CmsArticle) {
  return {
    ...article,
    tags: article.tags ? JSON.parse(article.tags) : [],
    schemaData: article.schemaData ? JSON.parse(article.schemaData) : null,
  };
}
