import { unstable_cache } from "next/cache";
import { createAnonClient, createServiceClient } from "@/lib/supabase/server";
import type { Product, PaginatedResponse } from "@/lib/types";
import type { CreateProductInput, UpdateProductInput } from "@/lib/validators";

interface SearchFilters {
  category?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  availability?: string;
}

// ─── Raw fetchers (never called directly from pages) ─────────────────────────

async function _searchProducts(
  query: string,
  page: number,
  limit: number,
  filters?: SearchFilters
): Promise<PaginatedResponse<Product>> {
  const client = createAnonClient();
  const offset = (page - 1) * limit;

  let builder = client.from("products").select("*", { count: "planned" });

  if (query) {
    builder = builder.or(
      `name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,brand.ilike.%${query}%`
    );
  }

  if (filters?.category) builder = builder.eq("category", filters.category);
  if (filters?.brand) builder = builder.eq("brand", filters.brand);
  if (filters?.availability) builder = builder.eq("availability", filters.availability);
  if (filters?.min_price !== undefined) builder = builder.gte("price", filters.min_price);
  if (filters?.max_price !== undefined) builder = builder.lte("price", filters.max_price);

  const { data, error, count } = await builder
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    data: (data as Product[]) ?? [],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async function _getAllCategories(): Promise<string[]> {
  const client = createAnonClient();
  const { data, error } = await client
    .from("products")
    .select("category")
    .not("category", "is", null)
    .order("category", { ascending: true });
  if (error) throw new Error(error.message);
  return [...new Set((data ?? []).map((r: { category: string }) => r.category))];
}

async function _getAllBrands(): Promise<string[]> {
  const client = createAnonClient();
  const { data, error } = await client
    .from("products")
    .select("brand")
    .not("brand", "is", null)
    .order("brand", { ascending: true });
  if (error) throw new Error(error.message);
  return [...new Set((data ?? []).map((r: { brand: string }) => r.brand))];
}

// ─── Cached exports ───────────────────────────────────────────────────────────
// unstable_cache stores results in Next.js's persistent data cache (filesystem).
// Cache hits never touch the network — ~0ms. Misses fetch once and cache the result.

export const searchProducts = unstable_cache(
  _searchProducts,
  ["search-products"],
  { revalidate: 300, tags: ["products"] }
);

export const getAllCategories = unstable_cache(
  _getAllCategories,
  ["all-categories"],
  { revalidate: 3600, tags: ["products"] }
);

export const getAllBrands = unstable_cache(
  _getAllBrands,
  ["all-brands"],
  { revalidate: 3600, tags: ["products"] }
);

// ─── Uncached writes & single-item reads ─────────────────────────────────────

export async function getProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  const client = createAnonClient();

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  const { data: product, error } = await client
    .from("products")
    .select("*")
    .eq(isUuid ? "id" : "slug", idOrSlug)
    .single();

  if (error || !product) return null;
  return product as Product;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const client = createServiceClient();

  const { data, error } = await client
    .from("products")
    .insert({ ...input, rating: 0, rating_count: 0 })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Product;
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const client = createServiceClient();

  const { data, error } = await client
    .from("products")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const client = createServiceClient();

  const { error } = await client.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
