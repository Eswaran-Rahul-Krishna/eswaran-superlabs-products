import { Star } from "lucide-react";
import type { Review } from "@/lib/types";

interface ReviewsListProps {
  reviews: Review[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewItem({ review }: { review: Review }) {
  return (
    <div className="py-4 border-b border-border last:border-0">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm">{review.reviewer_name}</span>
        <time className="text-xs text-muted-foreground">
          {new Date(review.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </time>
      </div>
      <StarRating rating={review.rating} />
      <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
    </div>
  );
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No reviews yet. Be the first to review this product.
      </p>
    );
  }

  return (
    <div>
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}
