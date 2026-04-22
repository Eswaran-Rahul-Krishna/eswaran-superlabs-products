"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface FilterPanelProps {
  categories: string[];
  brands: string[];
  currentCategory?: string;
  currentBrand?: string;
  currentAvailability?: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
}

export function FilterPanel({
  categories,
  brands,
  currentCategory,
  currentBrand,
  currentAvailability,
  currentMinPrice,
  currentMaxPrice,
}: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearFilters = () => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters =
    currentCategory || currentBrand || currentAvailability || currentMinPrice || currentMaxPrice;

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Category</label>
        <select
          value={currentCategory ?? ""}
          onChange={(e) => updateParam("category", e.target.value || undefined)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Brand */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Brand</label>
        <select
          value={currentBrand ?? ""}
          onChange={(e) => updateParam("brand", e.target.value || undefined)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* Availability */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Availability</label>
        <select
          value={currentAvailability ?? ""}
          onChange={(e) => updateParam("availability", e.target.value || undefined)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Any</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Price Range (₹)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            min={0}
            value={currentMinPrice ?? ""}
            onChange={(e) => updateParam("min_price", e.target.value || undefined)}
            className="w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="number"
            placeholder="Max"
            min={0}
            value={currentMaxPrice ?? ""}
            onChange={(e) => updateParam("max_price", e.target.value || undefined)}
            className="w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
    </div>
  );
}
