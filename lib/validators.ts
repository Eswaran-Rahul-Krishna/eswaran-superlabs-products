import { z } from "zod";

const ProductImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1),
});

export const CreateProductSchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  price: z.number().positive(),
  compare_at_price: z.number().positive().nullable().optional(),
  images: z.array(ProductImageSchema).min(1),
  category: z.string().min(1).max(100),
  brand: z.string().min(1).max(100),
  tags: z.array(z.string()).default([]),
  availability: z.enum(["in_stock", "out_of_stock", "low_stock"]),
  stock_quantity: z.number().int().min(0),
  specifications: z.record(z.string(), z.unknown()).default({}),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const SearchQuerySchema = z.object({
  q: z.string().optional().default(""),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  category: z.string().optional(),
  brand: z.string().optional(),
  min_price: z.coerce.number().positive().optional(),
  max_price: z.coerce.number().positive().optional(),
  availability: z.enum(["in_stock", "out_of_stock", "low_stock"]).optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type SearchQueryInput = z.infer<typeof SearchQuerySchema>;
