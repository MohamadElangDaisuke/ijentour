import { z } from "zod";
import { safeJsonParse } from "@/lib/prisma";
import type {
  TravelResourceChecklistItem,
  TravelResourceDTO,
} from "@/lib/travel-resources-defaults";

export const checklistItemSchema = z.object({
  title: z.string().trim().min(1, "Item title is required").max(120, "Item title is too long"),
  desc: z.string().trim().min(1, "Item description is required").max(600, "Item description is too long"),
  highlight: z
    .string()
    .trim()
    .max(300, "Highlight note is too long")
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
});

const linkSchema = z
  .string()
  .trim()
  .max(500, "Link is too long")
  .optional()
  .nullable()
  .refine(
    (val) => {
      if (!val || val.length === 0) return true;
      if (val.startsWith("/")) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Link must be a valid http(s) URL or internal path starting with /" }
  )
  .transform((val) => (val && val.trim().length > 0 ? val.trim() : null));

export const travelResourceCreateSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(140, "Title is too long"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(800, "Description is too long"),
  category: z
    .string()
    .trim()
    .min(2, "Category / tab label must be at least 2 characters")
    .max(80, "Category is too long"),
  icon: z.string().trim().min(1).max(40).optional().default("FileText"),
  link: linkSchema,
  items: z.array(checklistItemSchema).optional().default([]),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const travelResourceUpdateSchema = travelResourceCreateSchema.partial();

export function serializeTravelResource(row: {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  icon: string | null;
  link: string | null;
  items: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): TravelResourceDTO {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    category: row.category,
    icon: row.icon || "FileText",
    link: row.link,
    items: safeJsonParse<TravelResourceChecklistItem[]>(row.items, []),
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

