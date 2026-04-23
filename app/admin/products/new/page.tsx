"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { FadeInUp } from "@/components/animations/FadeInUp";
import { createProductAction } from "../../actions";
import type { CreateProductInput } from "@/lib/validators";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateProductInput) => {
    setLoading(true);
    setError(null);

    try {
      await createProductAction(data);
      toast.success("Product created successfully");
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold">New Product</h1>
        </div>

        <ProductForm
          onSubmit={handleSubmit}
          submitLabel="Create Product"
          loading={loading}
          error={error}
        />
      </div>
    </FadeInUp>
  );
}
