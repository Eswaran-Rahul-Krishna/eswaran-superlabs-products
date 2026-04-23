"use server";

import { revalidateTag } from "next/cache";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductByIdOrSlug,
} from "@/lib/repositories/product.repository";
import { CreateProductSchema, UpdateProductSchema } from "@/lib/validators";
import type { CreateProductInput, UpdateProductInput } from "@/lib/validators";
import type { Product } from "@/lib/types";

export async function createProductAction(data: CreateProductInput): Promise<Product> {
  const parsed = CreateProductSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  const product = await createProduct(parsed.data);
  revalidateTag("products");
  return product;
}

export async function updateProductAction(id: string, data: UpdateProductInput): Promise<Product> {
  const parsed = UpdateProductSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  const existing = await getProductByIdOrSlug(id);
  if (!existing) throw new Error("Product not found");
  const product = await updateProduct(id, parsed.data);
  revalidateTag("products");
  return product;
}

export async function deleteProductAction(id: string): Promise<void> {
  await deleteProduct(id);
  revalidateTag("products");
}
