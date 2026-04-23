"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { FadeInUp } from "@/components/animations/FadeInUp";
import { updateProductAction } from "../../actions";
import type { CreateProductInput } from "@/lib/validators";
import type { Product } from "@/lib/types";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productId, setProductId] = useState<string>("");

  useEffect(() => {
    params.then(({ id }) => {
      setProductId(id);
      fetch(`/api/products/${id}`)
        .then((r) => r.json())
        .then((data) => setProduct(data))
        .catch(() => toast.error("Failed to load product"))
        .finally(() => setFetching(false));
    });
  }, [params]);

  const handleSubmit = async (data: CreateProductInput) => {
    setLoading(true);
    setError(null);

    try {
      await updateProductAction(productId, data);
      toast.success("Product updated successfully");
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  return (
    <FadeInUp>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold">Edit Product</h1>
        </div>

        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          loading={loading}
          error={error}
        />
      </div>
    </FadeInUp>
  );
}
