"use client";

import { useEffect, useRef, useState } from "react";
import type { CreateProductInput } from "@/lib/validators";

type ProductFormData = Omit<CreateProductInput, "images" | "tags" | "specifications"> & {
  imagesRaw: string;
  tagsRaw: string;
  specificationsRaw: string;
};

interface ProductFormProps {
  initialData?: Partial<CreateProductInput>;
  onSubmit: (data: CreateProductInput) => Promise<void>;
  submitLabel: string;
  loading: boolean;
  error: string | null;
}

const defaultFormData: ProductFormData = {
  sku: "",
  name: "",
  slug: "",
  description: "",
  price: 0,
  compare_at_price: null,
  imagesRaw: '[{"url":"https://picsum.photos/seed/product/600","alt":"Product image"}]',
  category: "",
  brand: "",
  tagsRaw: "",
  availability: "in_stock",
  stock_quantity: 0,
  specificationsRaw: "{}",
};

export function ProductForm({
  initialData,
  onSubmit,
  submitLabel,
  loading,
  error,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(() => {
    if (!initialData) return defaultFormData;
    return {
      sku: initialData.sku ?? "",
      name: initialData.name ?? "",
      slug: initialData.slug ?? "",
      description: initialData.description ?? "",
      price: initialData.price ?? 0,
      compare_at_price: initialData.compare_at_price ?? null,
      imagesRaw: JSON.stringify(initialData.images ?? []),
      category: initialData.category ?? "",
      brand: initialData.brand ?? "",
      tagsRaw: (initialData.tags ?? []).join(", "),
      availability: initialData.availability ?? "in_stock",
      stock_quantity: initialData.stock_quantity ?? 0,
      specificationsRaw: JSON.stringify(initialData.specifications ?? {}),
    };
  });

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const set = (field: keyof ProductFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateProductInput = {
      sku: form.sku,
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      images: JSON.parse(form.imagesRaw),
      category: form.category,
      brand: form.brand,
      tags: form.tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      availability: form.availability,
      stock_quantity: Number(form.stock_quantity),
      specifications: JSON.parse(form.specificationsRaw),
    };

    await onSubmit(payload);
  };

  const fieldClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
  const labelClass = "block text-sm font-medium mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>SKU *</label>
          <input ref={nameRef} className={fieldClass} value={form.sku} onChange={set("sku")} required />
        </div>
        <div>
          <label className={labelClass}>Name *</label>
          <input className={fieldClass} value={form.name} onChange={set("name")} required />
        </div>
        <div>
          <label className={labelClass}>Slug *</label>
          <input className={fieldClass} value={form.slug} onChange={set("slug")} pattern="[a-z0-9-]+" required />
        </div>
        <div>
          <label className={labelClass}>Brand *</label>
          <input className={fieldClass} value={form.brand} onChange={set("brand")} required />
        </div>
        <div>
          <label className={labelClass}>Category *</label>
          <input className={fieldClass} value={form.category} onChange={set("category")} required />
        </div>
        <div>
          <label className={labelClass}>Availability *</label>
          <select className={fieldClass} value={form.availability} onChange={set("availability")}>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Price (₹) *</label>
          <input className={fieldClass} type="number" min="0" step="0.01" value={form.price} onChange={set("price")} required />
        </div>
        <div>
          <label className={labelClass}>Compare At Price (₹)</label>
          <input className={fieldClass} type="number" min="0" step="0.01" value={form.compare_at_price ?? ""} onChange={set("compare_at_price")} />
        </div>
        <div>
          <label className={labelClass}>Stock Quantity *</label>
          <input className={fieldClass} type="number" min="0" value={form.stock_quantity} onChange={set("stock_quantity")} required />
        </div>
        <div>
          <label className={labelClass}>Tags (comma separated)</label>
          <input className={fieldClass} value={form.tagsRaw} onChange={set("tagsRaw")} placeholder="electronics, laptop, gaming" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description *</label>
        <textarea
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={form.description}
          onChange={set("description")}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Images (JSON array) *</label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={form.imagesRaw}
          onChange={set("imagesRaw")}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Format: {`[{"url":"https://...","alt":"description"}]`}
        </p>
      </div>

      <div>
        <label className={labelClass}>Specifications (JSON object)</label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={form.specificationsRaw}
          onChange={set("specificationsRaw")}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Format: {`{"Weight":"1.5kg","Color":"Black"}`}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
