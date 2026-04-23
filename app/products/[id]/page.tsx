import { notFound } from "next/navigation";
import { ShoppingCart, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageGallery } from "@/components/ImageGallery";
import { FadeInUp } from "@/components/animations/FadeInUp";
import { getProductByIdOrSlug } from "@/lib/repositories/product.repository";
import { createAnonClient } from "@/lib/supabase/server";

// Pre-build every product page at deploy time; revalidate in background every hour.
export const revalidate = 3600;

export async function generateStaticParams() {
  const client = createAnonClient();
  const { data } = await client.from("products").select("slug");
  return (data ?? []).map((p: { slug: string }) => ({ id: p.slug }));
}

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

const availabilityConfig = {
  in_stock: { label: "In Stock", variant: "success" as const },
  low_stock: { label: "Low Stock", variant: "secondary" as const },
  out_of_stock: { label: "Out of Stock", variant: "destructive" as const },
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductByIdOrSlug(id);

  if (!product) notFound();

  const availability = availabilityConfig[product.availability];
  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - product.price) /
          product.compare_at_price!) *
          100
      )
    : 0;

  const specsEntries = Object.entries(product.specifications ?? {});

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <FadeInUp>
          <ImageGallery images={product.images} productName={product.name} />
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <div className="space-y-5">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                {product.brand}
              </p>
              <h1 className="text-2xl font-bold leading-snug">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={availability.variant}>{availability.label}</Badge>
              <span className="text-xs text-muted-foreground font-mono">
                SKU: {product.sku}
              </span>
            </div>

            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.compare_at_price!.toLocaleString("en-IN")}
                  </span>
                  <Badge variant="destructive">{discountPercent}% off</Badge>
                </>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="w-4 h-4" />
              <span>{product.stock_quantity} units in stock</span>
            </div>

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <button className="inline-flex items-center justify-center gap-2 h-12 px-8 w-full rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </FadeInUp>
      </div>

      <FadeInUp delay={0.2}>
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="border-b border-border">
            <div className="flex">
              <button className="px-6 py-3 text-sm font-medium border-b-2 border-primary text-primary">
                Specifications
              </button>
            </div>
          </div>

          <div className="p-6">
            {specsEntries.length > 0 ? (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specsEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between py-2 border-b border-border/60 last:border-0"
                  >
                    <dt className="text-sm text-muted-foreground">{key}</dt>
                    <dd className="text-sm font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                No specifications available.
              </p>
            )}
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}
