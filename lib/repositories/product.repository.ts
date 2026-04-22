import { createAnonClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import type {
  Product,
  ProductWithReviews,
  PaginatedResponse,
} from "@/lib/types";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/validators";

export async function searchProducts(
  query: string,
  page: number,
  limit: number,
  category?: string
): Promise<PaginatedResponse<Product>> {
  const client = createAnonClient();
  const offset = (page - 1) * limit;

  let builder = client
    .from("products")
    .select("*", { count: "exact" });

  if (query) {
    builder = builder.or(
      `name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,brand.ilike.%${query}%`
    );
  }

  if (category) {
    builder = builder.eq("category", category);
  }

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

export async function getProductByIdOrSlug(
  idOrSlug: string
): Promise<ProductWithReviews | null> {
  const client = createAnonClient();

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idOrSlug
    );

  const { data: product, error } = await client
    .from("products")
    .select("*")
    .eq(isUuid ? "id" : "slug", idOrSlug)
    .single();

  if (error || !product) return null;

  const { data: reviews } = await client
    .from("reviews")
    .select("*")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false });

  return { ...(product as Product), reviews: reviews ?? [] };
}

export async function createProduct(
  input: CreateProductInput
): Promise<Product> {
  const client = createServiceClient();

  const { data, error } = await client
    .from("products")
    .insert({
      ...input,
      rating: 0,
      rating_count: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Product;
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput
): Promise<Product> {
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

export async function getAllCategories(): Promise<string[]> {
  const client = createAnonClient();

  const { data, error } = await client
    .from("products")
    .select("category");

  if (error) throw new Error(error.message);

  const unique = [...new Set((data ?? []).map((r: { category: string }) => r.category))];
  return unique.sort();
}
