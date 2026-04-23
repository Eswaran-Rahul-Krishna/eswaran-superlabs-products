"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Star } from "lucide-react";
import type { Review } from "@/lib/types";

interface ProductTabsProps {
  specsEntries: [string, string][];
  reviews: Review[];
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

export function ProductTabs({ specsEntries, reviews }: ProductTabsProps) {
  return (
    <div className="space-y-8">
      {/* Specifications */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="border border-border rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold">Specifications</h2>
        </div>
        <div className="p-6">
          {specsEntries.length > 0 ? (
            <dl className="divide-y divide-border">
              {specsEntries.map(([key, value]) => (
                <div key={key} className="flex py-3 gap-4">
                  <dt className="w-44 shrink-0 text-sm text-muted-foreground">{key}</dt>
                  <dd className="text-sm font-medium">{String(value)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No specifications available.</p>
          )}
        </div>
      </motion.div>

      {/* Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        className="border border-border rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold">
            Reviews{reviews.length > 0 ? ` (${reviews.length})` : ""}
          </h2>
        </div>
        <div className="p-6">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review, i) => (
                <motion.li
                  key={review.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="rounded-lg border border-border p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{review.reviewer_name}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                  <p className="text-xs text-muted-foreground/60">
                    {new Date(review.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}
