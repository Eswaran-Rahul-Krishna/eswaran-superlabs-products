"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ProductTable } from "@/components/admin/ProductTable";
import { FadeInUp } from "@/components/animations/FadeInUp";
import { useAdminToken } from "@/components/admin/AdminAuthProvider";
import type { Product } from "@/lib/types";

export default function AdminPage() {
  const adminSecret = useAdminToken();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?limit=100");
      const json = await res.json();
      setProducts(json.data ?? []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {

    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminSecret}` },
    });

    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } else {
      toast.error("Failed to delete product");
    }
  };

  return (
    <FadeInUp>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-muted-foreground text-sm">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchProducts}
              className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-input hover:bg-accent transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Link href="/admin/products/new">
              <button className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                New Product
              </button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-border p-12 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : (
          <ProductTable products={products} onDelete={handleDelete} />
        )}
      </div>
    </FadeInUp>
  );
}
