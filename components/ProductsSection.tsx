"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/lib/types";

interface ProductsData {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function ProductsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function ProductsSectionInner() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ProductsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    (["q", "page", "category", "brand", "availability", "min_price", "max_price"] as const).forEach(
      (key) => {
        const val = searchParams.get(key);
        if (val) params.set(key, val);
      }
    );

    const controller = new AbortController();
    fetch(`/api/products?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((json: ProductsData) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setLoading(false);
      });

    return () => controller.abort();
  }, [searchParams]);

  const query = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));

  if (loading) return <ProductsSkeleton />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {data.total} product{data.total !== 1 ? "s" : ""} found
        {query && (
          <span>
            {" "}
            for{" "}
            <span className="font-medium text-foreground">
              &ldquo;{query}&rdquo;
            </span>
          </span>
        )}
      </p>

      <ProductGrid products={data.data} />

      <Suspense>
        <Pagination page={page} totalPages={data.totalPages} />
      </Suspense>
    </div>
  );
}

// Suspense boundary required because ProductsSectionInner uses useSearchParams
export function ProductsSection() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsSectionInner />
    </Suspense>
  );
}
