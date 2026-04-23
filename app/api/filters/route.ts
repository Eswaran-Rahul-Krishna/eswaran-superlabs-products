import { NextResponse } from "next/server";
import { getAllCategories, getAllBrands } from "@/lib/repositories/product.repository";
import { serverError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const [categories, brands] = await Promise.all([
      getAllCategories(),
      getAllBrands(),
    ]);
    return NextResponse.json(
      { categories, brands },
      // Cache in browser for 1 hour; serve stale for up to 1 day while revalidating
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch {
    return serverError();
  }
}
