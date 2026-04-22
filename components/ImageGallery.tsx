"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import type { ProductImage } from "@/lib/types";

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-xl bg-muted flex items-center justify-center">
        <Package className="w-16 h-16 text-muted-foreground" />
      </div>
    );
  }

  const paginate = (newDirection: number) => {
    const next = (activeIndex + newDirection + images.length) % images.length;
    setDirection(newDirection);
    setActiveIndex(next);
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex].url}
              alt={images[activeIndex].alt || productName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={() => paginate(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => paginate(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > activeIndex ? 1 : -1);
                setActiveIndex(idx);
              }}
              className={`relative shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                idx === activeIndex
                  ? "border-primary"
                  : "border-transparent hover:border-border"
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
