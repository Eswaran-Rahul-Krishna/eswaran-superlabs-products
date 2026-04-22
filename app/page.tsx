import { Suspense } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { FilterPanel } from "@/components/FilterPanel";
import { FadeInUp } from "@/components/animations/FadeInUp";
import {
  searchProducts,
  getAllCategories,
  getAllBrands,
} from "@/lib/repositories/product.repository";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    category?: string;
    brand?: string;
    availability?: string;
    min_price?: string;
    max_price?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const page = Math.max(1, Number(params.page ?? 1));
  const category = params.category;
  const brand = params.brand;
  const availability = params.availability;
  const min_price = params.min_price ? Number(params.min_price) : undefined;
  const max_price = params.max_price ? Number(params.max_price) : undefined;

  const [{ data: products, total, totalPages }, categories, brands] =
    await Promise.all([
      searchProducts(query, page, 12, {
        category,
        brand,
        availability,
        min_price,
        max_price,
      }),
      getAllCategories(),
      getAllBrands(),
    ]);

  return (
    <div className="space-y-8">
      <FadeInUp>
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Discover Products
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Browse our curated collection of premium K-Beauty products.
          </p>
          <div className="flex justify-center">
            <Suspense>
              <SearchBar defaultValue={query} />
            </Suspense>
          </div>
        </div>
      </FadeInUp>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <aside>
          <Suspense>
            <FilterPanel
              categories={categories}
              brands={brands}
              currentCategory={category}
              currentBrand={brand}
              currentAvailability={availability}
              currentMinPrice={params.min_price}
              currentMaxPrice={params.max_price}
            />
          </Suspense>
        </aside>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} product{total !== 1 ? "s" : ""} found
              {query && (
                <span>
                  {" "}for{" "}
                  <span className="font-medium text-foreground">
                    &ldquo;{query}&rdquo;
                  </span>
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
      </div>
    </div>
  );
}

