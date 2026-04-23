"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FilterPanel } from "@/components/FilterPanel";
import { Skeleton } from "@/components/ui/skeleton";

interface FiltersData {
  categories: string[];
  brands: string[];
}

function FilterSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-5">
      <Skeleton className="h-4 w-16" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-md" />
          <Skeleton className="h-9 flex-1 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function FilterSectionInner() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FiltersData | null>(null);

  useEffect(() => {
    fetch("/api/filters")
      .then((res) => res.json())
      .then((json: FiltersData) => setFilters(json))
      .catch(() => setFilters({ categories: [], brands: [] }));
  }, []); // fetch once — categories/brands don't change per navigation

  if (!filters) return <FilterSkeleton />;

  return (
    <FilterPanel
      categories={filters.categories}
      brands={filters.brands}
      currentCategory={searchParams.get("category") ?? undefined}
      currentBrand={searchParams.get("brand") ?? undefined}
      currentAvailability={searchParams.get("availability") ?? undefined}
      currentMinPrice={searchParams.get("min_price") ?? undefined}
      currentMaxPrice={searchParams.get("max_price") ?? undefined}
    />
  );
}

// Suspense boundary required because FilterSectionInner uses useSearchParams
export function FilterSection() {
  return (
    <Suspense fallback={<FilterSkeleton />}>
      <FilterSectionInner />
    </Suspense>
  );
}
