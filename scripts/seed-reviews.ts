/**
 * Seeds reviews for all products already in the database.
 * Uses the product's real averageRating + reviewsCount from the DB
 * to generate realistic, distribution-accurate reviews.
 *
 * Safe to re-run — skips if reviews already exist.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/seed-reviews.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BATCH_SIZE = 50;

// ─── Reviewer names & comment templates ──────────────────────────────────────

const REVIEWER_NAMES = [
  "Priya S.", "Anjali M.", "Deepa R.", "Kavita N.", "Shalini T.",
  "Meena L.", "Rupa K.", "Nisha P.", "Divya G.", "Leela B.",
  "Arun V.", "Kiran D.", "Sunita H.", "Rekha J.", "Pooja C.",
  "Tanya B.", "Sneha A.", "Latha R.", "Harini M.", "Anu K.",
];

const REVIEW_TEMPLATES: Record<number, string[]> = {
  5: [
    "Absolutely love this product! My skin feels amazing after just a week.",
    "One of the best purchases I've made. Highly recommend to everyone.",
    "Exceeded my expectations. Great quality and fast absorption.",
    "My skin has never looked this good. Will definitely repurchase.",
    "Perfect product! Gentle on my sensitive skin and works brilliantly.",
    "Game changer for my skincare routine. Visible results in days.",
    "Obsessed! The texture is so light and my skin loves it.",
  ],
  4: [
    "Really good product. Noticed visible improvement in a few days.",
    "Nice texture and pleasant scent. Works as described.",
    "Good value for money. Will buy again.",
    "Effective and easy to use. Skin feels softer already.",
    "Works well for my skin type. A bit pricey but worth it.",
    "Great product overall. Packaging could be improved.",
    "Solid performer. Has become a staple in my routine.",
  ],
  3: [
    "Decent product but expected more for the price.",
    "Average results. May work better for other skin types.",
    "It's okay. Did not see dramatic changes but not bad.",
    "Neutral experience. Packaging could be better.",
    "Mildly effective. Still giving it more time.",
    "Works as advertised but nothing extraordinary.",
  ],
  2: [
    "Didn't work well for my skin. Felt heavy.",
    "Expected more from the reviews. Disappointing.",
    "Product is average. Would not repurchase.",
    "Not worth the price. Minimal results.",
    "Caused mild irritation. Might work for others.",
  ],
  1: [
    "Did not work for me at all.",
    "Had a reaction to this. Not recommended for sensitive skin.",
    "Very disappointed. Expected much better.",
    "Returned after the first use.",
  ],
};

function generateReviews(
  productId: string,
  avgRating: number,
  reviewCount: number
) {
  // Seed up to 8 reviews per product to keep the DB manageable
  const count = Math.min(reviewCount, 8);
  const reviews = [];
  for (let i = 0; i < count; i++) {
    const jitter = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
    const rating = Math.max(1, Math.min(5, Math.round(avgRating) + jitter));
    const templates = REVIEW_TEMPLATES[rating];
    const comment = templates[Math.floor(Math.random() * templates.length)];
    const reviewer_name =
      REVIEWER_NAMES[Math.floor(Math.random() * REVIEWER_NAMES.length)];
    // Stagger created_at over the past 12 months
    const daysAgo = Math.floor(Math.random() * 365);
    const created_at = new Date(
      Date.now() - daysAgo * 86400000
    ).toISOString();
    reviews.push({ product_id: productId, reviewer_name, rating, comment, created_at });
  }
  return reviews;
}

async function seedReviews() {
  console.log("=== Beauty Barn Review Seeder ===\n");

  // 1. Check if reviews already exist
  const { count: existingCount, error: countErr } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true });

  if (countErr) {
    console.error("❌  Could not query reviews table:", countErr.message);
    console.error(
      "    If the table does not exist, run: npm run migrate  first."
    );
    process.exit(1);
  }

  if ((existingCount ?? 0) > 0) {
    console.log(
      `⚠️   Skipped — ${existingCount} reviews already exist in the database.`
    );
    return;
  }

  // 2. Fetch all products with a non-zero rating_count
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, rating, rating_count")
    .gt("rating_count", 0);

  if (prodErr) {
    console.error("❌  Could not fetch products:", prodErr.message);
    process.exit(1);
  }

  const dbProducts = (products ?? []) as {
    id: string;
    rating: number;
    rating_count: number;
  }[];

  console.log(`Found ${dbProducts.length} products with rating data.\n`);

  // 3. Generate reviews
  const allReviews: {
    product_id: string;
    reviewer_name: string;
    rating: number;
    comment: string;
    created_at: string;
  }[] = [];

  for (const p of dbProducts) {
    allReviews.push(...generateReviews(p.id, p.rating, p.rating_count));
  }

  console.log(`Seeding ${allReviews.length} reviews...\n`);

  // 4. Insert in batches
  let inserted = 0;
  for (let i = 0; i < allReviews.length; i += BATCH_SIZE) {
    const batch = allReviews.slice(i, i + BATCH_SIZE);
    const { error: insErr } = await supabase.from("reviews").insert(batch);
    if (insErr) {
      console.error(
        `  ❌  Batch ${i + 1}–${i + batch.length} failed: ${insErr.message}`
      );
    } else {
      inserted += batch.length;
      console.log(
        `  ✅  Batch ${i + 1}–${i + batch.length} inserted (${inserted}/${allReviews.length})`
      );
    }
  }

  console.log(`\n✅  Done! ${inserted} reviews seeded across ${dbProducts.length} products.`);
}

seedReviews().catch((err) => {
  console.error(err);
  process.exit(1);
});
