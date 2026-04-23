import { Suspense } from "react";
import { SearchBar } from "@/components/SearchBar";
import { FadeInUp } from "@/components/animations/FadeInUp";
import { FilterSection } from "@/components/FilterSection";
import { ProductsSection } from "@/components/ProductsSection";

interface HomePageProps {
  searchParams: Promise<{ q?: string }>;
}

// Page shell is pure SSR with zero network calls — renders in <5ms.
// All data (products, filters) is fetched client-side via /api/* routes.
export default async function HomePage({ searchParams }: HomePageProps) {
  // await searchParams is a local Next.js unwrap, not a network call.
  const params = await searchParams;
  const query = params.q ?? "";

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
          <FilterSection />
        </aside>

        <ProductsSection />
      </div>
    </div>
  );
}

