"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

const availabilityConfig = {
  in_stock: { label: "In Stock", variant: "success" as const },
  low_stock: { label: "Low Stock", variant: "secondary" as const },
  out_of_stock: { label: "Out of Stock", variant: "destructive" as const },
};

export function ProductCard({ product }: ProductCardProps) {
  const availability = availabilityConfig[product.availability];
  const primaryImage = product.images[0];
  const hasDiscount =
    product.compare_at_price && product.compare_at_price > product.price;

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link href={`/products/${product.slug}`}>
        <Card className="overflow-hidden h-full flex flex-col group cursor-pointer border-border/60 hover:border-border hover:shadow-lg transition-all duration-300">
          <div className="relative aspect-square overflow-hidden bg-muted">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-2 left-2">
                <Badge variant="destructive" className="text-xs">
                  Sale
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-4 flex flex-col flex-1 gap-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {product.brand}
              </p>
              <Badge variant={availability.variant} className="shrink-0">
                {availability.label}
              </Badge>
            </div>

            <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {product.rating_count > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs text-muted-foreground">
                  {product.rating.toFixed(1)} ({product.rating_count})
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1 mt-auto">
              <span className="font-bold text-base">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{product.compare_at_price!.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
