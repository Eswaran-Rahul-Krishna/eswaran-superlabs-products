"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Upload, Package, Loader2,
  Layers, IndianRupee, Camera, FileText,
  Tag as TagIcon, SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CreateProductInput } from "@/lib/validators";

interface ImageEntry { url: string; alt: string; }
interface SpecEntry { key: string; value: string; }

interface FormState {
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  compare_at_price: string;
  images: ImageEntry[];
  category: string;
  brand: string;
  tags: string[];
  tagInput: string;
  availability: "in_stock" | "low_stock" | "out_of_stock";
  stock_quantity: string;
  specs: SpecEntry[];
}

interface ProductFormProps {
  initialData?: Partial<CreateProductInput>;
  onSubmit: (data: CreateProductInput) => Promise<void>;
  submitLabel: string;
  loading: boolean;
  error: string | null;
}

const availabilityConfig = {
  in_stock: { label: "In Stock", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  low_stock: { label: "Low Stock", color: "bg-amber-100 text-amber-700 border-amber-200" },
  out_of_stock: { label: "Out of Stock", color: "bg-red-100 text-red-700 border-red-200" },
} as const;

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function Section({
  icon,
  title,
  delay = 0,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="rounded-2xl border border-border bg-card p-5 space-y-4"
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="p-1.5 rounded-lg bg-primary/10 text-primary">{icon}</span>
        {title}
      </div>
      {children}
    </motion.div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium">{label}</label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function ProductForm({
  initialData,
  onSubmit,
  submitLabel,
  loading,
  error,
}: ProductFormProps) {
  const [form, setForm] = useState<FormState>(() => {
    if (!initialData) {
      return {
        sku: "", name: "", slug: "", description: "",
        price: "", compare_at_price: "",
        images: [{ url: "", alt: "" }],
        category: "", brand: "", tags: [], tagInput: "",
        availability: "in_stock", stock_quantity: "0", specs: [],
      };
    }
    return {
      sku: initialData.sku ?? "",
      name: initialData.name ?? "",
      slug: initialData.slug ?? "",
      description: initialData.description ?? "",
      price: String(initialData.price ?? ""),
      compare_at_price: initialData.compare_at_price ? String(initialData.compare_at_price) : "",
      images: initialData.images?.length ? initialData.images : [{ url: "", alt: "" }],
      category: initialData.category ?? "",
      brand: initialData.brand ?? "",
      tags: initialData.tags ?? [],
      tagInput: "",
      availability: initialData.availability ?? "in_stock",
      stock_quantity: String(initialData.stock_quantity ?? "0"),
      specs: Object.entries(initialData.specifications ?? {}).map(([key, value]) => ({
        key,
        value: String(value),
      })),
    };
  });

  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      name: val,
      slug:
        prev.slug === "" || prev.slug === toSlug(prev.name)
          ? toSlug(val)
          : prev.slug,
    }));
  };

  // Images
  const updateImage = (idx: number, field: keyof ImageEntry, val: string) =>
    set("images", form.images.map((img, i) => (i === idx ? { ...img, [field]: val } : img)));

  const addImage = () => {
    set("images", [...form.images, { url: "", alt: "" }]);
    setActiveImageIdx(form.images.length);
  };

  const removeImage = (idx: number) => {
    const updated = form.images.filter((_, i) => i !== idx);
    set("images", updated.length ? updated : [{ url: "", alt: "" }]);
    setActiveImageIdx(Math.min(activeImageIdx, Math.max(0, updated.length - 1)));
  };

  const handleFileUpload = (idx: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const autoAlt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setForm((prev) => ({
        ...prev,
        images: prev.images.map((img, i) =>
          i === idx
            ? { url: dataUrl, alt: img.alt || autoAlt }
            : img
        ),
      }));
      setActiveImageIdx(idx);
    };
    reader.readAsDataURL(file);
  };

  // Tags
  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    set("tagInput", "");
  };

  // Specs
  const addSpec = () => set("specs", [...form.specs, { key: "", value: "" }]);
  const updateSpec = (idx: number, field: keyof SpecEntry, val: string) =>
    set("specs", form.specs.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));
  const removeSpec = (idx: number) =>
    set("specs", form.specs.filter((_, i) => i !== idx));

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateProductInput = {
      sku: form.sku,
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      images: form.images.filter((img) => img.url.trim()),
      category: form.category,
      brand: form.brand,
      tags: form.tags,
      availability: form.availability,
      stock_quantity: Number(form.stock_quantity),
      specifications: Object.fromEntries(
        form.specs.filter((s) => s.key.trim()).map((s) => [s.key, s.value])
      ),
    };
    await onSubmit(payload);
  };

  // Preview values
  const previewUrl =
    form.images[activeImageIdx]?.url ||
    form.images.find((img) => img.url)?.url ||
    "";
  const price = Number(form.price) || 0;
  const comparePrice = Number(form.compare_at_price) || 0;
  const hasDiscount = comparePrice > 0 && comparePrice > price;
  const discountPct = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;
  const avail = availabilityConfig[form.availability];

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
        {/* â”€â”€ LEFT: Form sections â”€â”€ */}
        <div className="space-y-5">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Basic Info */}
          <Section icon={<Layers className="w-4 h-4" />} title="Basic Information" delay={0.05}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Product Name *">
                <Input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  placeholder="e.g. COSRX Snail Mucin Essence"
                />
              </Field>
              <Field label="SKU *">
                <Input
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                  required
                  placeholder="e.g. COSRX-SM-100"
                />
              </Field>
              <Field label="Slug *" hint="Auto-filled from name">
                <Input
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  required
                  pattern="[a-z0-9-]+"
                  placeholder="cosrx-snail-mucin"
                />
              </Field>
              <Field label="Brand">
                <Input
                  value={form.brand}
                  onChange={(e) => set("brand", e.target.value)}
                  placeholder="e.g. COSRX"
                />
              </Field>
              <Field label="Category *">
                <Input
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  required
                  placeholder="e.g. Serum"
                />
              </Field>
              <Field label="Availability *">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.availability}
                  onChange={(e) =>
                    set("availability", e.target.value as FormState["availability"])
                  }
                >
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* Pricing */}
          <Section icon={<IndianRupee className="w-4 h-4" />} title="Pricing & Inventory" delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Price (INR) *">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none select-none">₹</span>
                  <Input
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value.replace(/[^0-9.]/g, ""))}
                    required
                    placeholder="999"
                    className="pl-7"
                  />
                </div>
              </Field>
              <Field label="Compare At Price (INR)" hint="Crossed-out price">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none select-none">₹</span>
                  <Input
                    inputMode="decimal"
                    value={form.compare_at_price}
                    onChange={(e) => set("compare_at_price", e.target.value.replace(/[^0-9.]/g, ""))}
                    placeholder="1299"
                    className="pl-7"
                  />
                </div>
              </Field>
              <Field label="Stock Quantity *">
                <Input
                  type="number"
                  min="0"
                  value={form.stock_quantity}
                  onChange={(e) => set("stock_quantity", e.target.value)}
                  required
                  placeholder="50"
                />
              </Field>
            </div>
          </Section>

          {/* Images */}
          <Section icon={<Camera className="w-4 h-4" />} title="Product Images" delay={0.15}>
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {form.images.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-3 items-start p-3 rounded-xl border border-border bg-muted/30">
                      {/* Thumbnail */}
                      <button
                        type="button"
                        onClick={() => setActiveImageIdx(idx)}
                        className={`w-14 h-14 rounded-lg border overflow-hidden shrink-0 transition-all ${
                          activeImageIdx === idx
                            ? "ring-2 ring-primary border-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {img.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img.url}
                            alt={img.alt || "preview"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <Camera className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </button>

                      {/* URL + alt */}
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={img.url}
                            onChange={(e) => updateImage(idx, "url", e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="text-xs"
                          />
                          {/* File picker */}
                          <button
                            type="button"
                            title="Upload from device"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "image/*";
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleFileUpload(idx, file);
                              };
                              input.click();
                            }}
                            className="shrink-0 flex items-center gap-1.5 px-3 h-10 rounded-md border border-dashed border-primary/50 text-primary hover:bg-primary/5 transition-colors text-xs font-medium"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Upload
                          </button>
                        </div>
                        <Input
                          value={img.alt}
                          onChange={(e) => updateImage(idx, "alt", e.target.value)}
                          placeholder="Alt text â€” e.g. Product front view"
                          className="text-xs"
                        />
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="mt-1 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <button
                type="button"
                onClick={addImage}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/40 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Image
              </button>
            </div>
          </Section>

          {/* Description */}
          <Section icon={<FileText className="w-4 h-4" />} title="Description" delay={0.2}>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
              rows={5}
              placeholder="Describe your product â€” ingredients, benefits, how to useâ€¦"
              className="resize-none"
            />
          </Section>

          {/* Tags */}
          <Section icon={<TagIcon className="w-4 h-4" />} title="Tags" delay={0.25}>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={form.tagInput}
                  onChange={(e) => set("tagInput", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag(form.tagInput);
                    }
                  }}
                  placeholder="Type a tag and press Enter or comma"
                />
                <button
                  type="button"
                  onClick={() => addTag(form.tagInput)}
                  className="px-4 h-10 rounded-md border border-input bg-background hover:bg-muted text-sm transition-colors shrink-0"
                >
                  Add
                </button>
              </div>
              <AnimatePresence>
                {form.tags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-wrap gap-2"
                  >
                    {form.tags.map((tag, i) => (
                      <motion.span
                        key={tag}
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.7, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => set("tags", form.tags.filter((_, j) => j !== i))}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Section>

          {/* Specifications */}
          <Section icon={<SlidersHorizontal className="w-4 h-4" />} title="Specifications" delay={0.3}>
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {form.specs.map((spec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2 items-center">
                      <Input
                        value={spec.key}
                        onChange={(e) => updateSpec(idx, "key", e.target.value)}
                        placeholder="e.g. Weight"
                        className="text-sm"
                      />
                      <span className="text-muted-foreground text-sm shrink-0">:</span>
                      <Input
                        value={spec.value}
                        onChange={(e) => updateSpec(idx, "value", e.target.value)}
                        placeholder="e.g. 100ml"
                        className="text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpec(idx)}
                        className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <button
                type="button"
                onClick={addSpec}
                className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/40 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Specification
              </button>
            </div>
          </Section>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.015 }}
            whileTap={{ scale: loading ? 1 : 0.985 }}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Savingâ€¦
              </>
            ) : (
              submitLabel
            )}
          </motion.button>
        </div>

        {/* â”€â”€ RIGHT: Live preview â”€â”€ */}
        <div className="hidden xl:block">
          <div className="sticky top-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Live Preview
            </p>

            <motion.div
              layout
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg"
            >
              {/* Image area */}
              <div className="relative aspect-square bg-muted">
                <AnimatePresence mode="wait">
                  {previewUrl ? (
                    <motion.img
                      key={previewUrl.slice(0, 40)}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      src={previewUrl}
                      alt={form.images[activeImageIdx]?.alt || form.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground"
                    >
                      <Package className="w-12 h-12" />
                      <span className="text-xs">No image</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {hasDiscount && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-destructive text-destructive-foreground">
                      Sale
                    </span>
                  </div>
                )}

                {/* Image dot indicators */}
                {form.images.filter((i) => i.url).length > 1 && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                    {form.images.filter((i) => i.url).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImageIdx(i)}
                        className={`rounded-full transition-all duration-200 ${
                          i === activeImageIdx
                            ? "w-4 h-1.5 bg-white"
                            : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Card info */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  {form.brand && form.brand.toLowerCase() !== "unknown" && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {form.brand}
                    </span>
                  )}
                  <span
                    className={`ml-auto shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${avail.color}`}
                  >
                    {avail.label}
                  </span>
                </div>

                <p className="font-semibold text-sm leading-snug">
                  {form.name || (
                    <span className="text-muted-foreground italic text-xs">
                      Product name will appear here
                    </span>
                  )}
                </p>

                {form.category && (
                  <p className="text-xs text-muted-foreground">{form.category}</p>
                )}

                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {form.tags.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                    {form.tags.length > 4 && (
                      <span className="text-xs text-muted-foreground">
                        +{form.tags.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  {price > 0 ? (
                    <span className="font-bold text-base">
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">No price set</span>
                  )}
                  {hasDiscount && (
                    <>
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{comparePrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600">
                        {discountPct}% off
                      </span>
                    </>
                  )}
                </div>

                {Number(form.stock_quantity) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {form.stock_quantity} units in stock
                  </p>
                )}
              </div>
            </motion.div>

            {/* Thumbnail strip */}
            {form.images.filter((i) => i.url).length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {form.images
                  .filter((i) => i.url)
                  .map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImageIdx(i)}
                      className={`w-12 h-12 rounded-lg border overflow-hidden transition-all ${
                        i === activeImageIdx
                          ? "ring-2 ring-primary border-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </button>
                  ))}
              </div>
            )}

            {/* Specs preview */}
            {form.specs.filter((s) => s.key && s.value).length > 0 && (
              <div className="rounded-xl border border-border p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Specifications
                </p>
                {form.specs
                  .filter((s) => s.key && s.value)
                  .slice(0, 6)
                  .map((s, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{s.key}</span>
                      <span className="font-medium">{s.value}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

