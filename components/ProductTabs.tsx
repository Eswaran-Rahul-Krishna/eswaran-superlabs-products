"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { Review } from "@/lib/types";

interface ProductTabsProps {
  specsEntries: [string, string][];
  reviews: Review[];
}

export function ProductTabs({ specsEntries, reviews }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Tab Bar */}
      <div className="border-b border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab("specs")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "specs"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "reviews"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "specs" && (
          <div>
            {specsEntries.length > 0 ? (
              <dl className="divide-y divide-border">
                {specsEntries.map(([key, value]) => (
                  <div key={key} className="flex py-3 gap-4">
                    <dt className="w-40 shrink-0 text-sm text-muted-foreground">
                      {key}
                    </dt>
                    <dd className="text-sm font-medium">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                No specifications available.
              </p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-lg border border-border p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">
                        {review.reviewer_name}
                      </span>
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
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      {new Date(review.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
