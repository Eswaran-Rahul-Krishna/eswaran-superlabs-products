"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/ProductGrid";
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

function InitialSkeleton() {
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

function LoadMoreSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

function ProductsSectionInner() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Stable filter key — when filters change, reset to page 1
  const filterKey = [
    searchParams.get("q") ?? "",
    searchParams.get("category") ?? "",
    searchParams.get("brand") ?? "",
    searchParams.get("availability") ?? "",
    searchParams.get("min_price") ?? "",
    searchParams.get("max_price") ?? "",
  ].join("|");

  const buildParams = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      (["q", "category", "brand", "availability", "min_price", "max_price"] as const).forEach(
        (key) => {
          const val = searchParams.get(key);
          if (val) params.set(key, val);
        }
      );
      params.set("page", String(page));
      params.set("limit", "12");
      return params;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterKey]
  );

  // Reset + fetch page 1 when filters change
  useEffect(() => {
    setInitialLoading(true);
    setProducts([]);
    setCurrentPage(1);

    const controller = new AbortController();
    fetch(`/api/products?${buildParams(1).toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((json: ProductsData) => {
        setProducts(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
        setCurrentPage(1);
        setInitialLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setInitialLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  // Load next page
  const loadMore = useCallback(() => {
    const nextPage = currentPage + 1;
    if (nextPage > totalPages || loadingMore) return;

    setLoadingMore(true);
    fetch(`/api/products?${buildParams(nextPage).toString()}`)
      .then((res) => res.json())
      .then((json: ProductsData) => {
        setProducts((prev) => [...prev, ...json.data]);
        setCurrentPage(nextPage);
        setLoadingMore(false);
      })
      .catch(() => setLoadingMore(false));
  }, [currentPage, totalPages, loadingMore, buildParams]);

  // IntersectionObserver on sentinel div
  useEffect(() => {
    if (initialLoading) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [initialLoading, loadMore]);

  const query = searchParams.get("q") ?? "";

  if (initialLoading) return <InitialSkeleton />;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {total} product{total !== 1 ? "s" : ""} found
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

      <ProductGrid products={products} />

      {loadingMore && <LoadMoreSkeleton />}

      {/* Sentinel – triggers next page load when it enters the viewport */}
      {currentPage < totalPages && !loadingMore && (
        <div ref={sentinelRef} className="h-4" />
      )}

      {currentPage >= totalPages && products.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          All products loaded
        </p>
      )}
    </div>
  );
}

export function ProductsSection() {
  return (
    <Suspense fallback={<InitialSkeleton />}>
      <ProductsSectionInner />
    </Suspense>
  );
}
