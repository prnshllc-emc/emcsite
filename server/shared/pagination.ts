/**
 * Pagination Module — Standardized cursor/offset pagination with Zod schemas.
 */
import { z } from "zod";

// ── Pagination Input Schema ──────────────────────────────────
export const PaginatedQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});

export type PaginatedQuery = z.infer<typeof PaginatedQuerySchema>;

// ── Paginated Result Type ────────────────────────────────────
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ── Helper to build paginated response ───────────────────────
export function paginatedResponse<T>(
  data: T[],
  total: number,
  query: PaginatedQuery
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / query.limit);
  return {
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNext: query.page < totalPages,
      hasPrev: query.page > 1,
    },
  };
}

// ── Calculate SQL offset ─────────────────────────────────────
export function calcOffset(query: PaginatedQuery): number {
  return (query.page - 1) * query.limit;
}
