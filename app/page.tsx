import { Suspense } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { FadeInUp } from "@/components/animations/FadeInUp";
import { searchProducts } from "@/lib/repositories/product.repository";

interface HomePageProps {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const page = Math.max(1, Number(params.page ?? 1));
  const category = params.category;

  const { data: products, total, totalPages } = await searchProducts(
    query,
    page,
    12,
    category
  );

  return (
    <div className="space-y-8">
      <FadeInUp>
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Discover Products
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Browse our curated collection of premium products.
          </p>
          <div className="flex justify-center">
            <Suspense>
              <SearchBar defaultValue={query} />
            </Suspense>
          </div>
        </div>
      </FadeInUp>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} product{total !== 1 ? "s" : ""} found
          {query && (
            <span>
              {" "}for <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
            </span>
          )}
        </p>
      </div>

      <ProductGrid products={products} />

      {totalPages > 1 && (
        <Suspense>
          <Pagination page={page} totalPages={totalPages} />
        </Suspense>
      )}
    </div>
  );
}
