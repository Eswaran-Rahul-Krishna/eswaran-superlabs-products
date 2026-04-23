/**
 * One-time seed script.
 * Fetches all products from the Beauty Barn API and upserts them into Supabase.
 * Safe to re-run — uses upsert on `sku`, so existing rows are updated, not duplicated.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/seed.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as https from "https";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const IMAGE_BASE = "https://beautybarn.blr1.digitaloceanspaces.com/";
const API_BASE = "https://virgincodes.com/api/v1/store/product-search?inStock=false&limit=50";
const MAX_PAGES = 20;
const BATCH_SIZE = 50;

// ─── Sample reviewers & comments for seeding ─────────────────────────────────

const REVIEWER_NAMES = [
  "Priya S.", "Anjali M.", "Deepa R.", "Kavita N.", "Shalini T.",
  "Meena L.", "Rupa K.", "Nisha P.", "Divya G.", "Leela B.",
  "Arun V.", "Kiran D.", "Sunita H.", "Rekha J.", "Pooja C.",
];

const REVIEW_TEMPLATES: Record<number, string[]> = {
  5: [
    "Absolutely love this product! My skin feels amazing after just a week.",
    "One of the best purchases I've made. Highly recommend to everyone.",
    "Exceeded my expectations. Great quality and fast absorption.",
    "My skin has never looked this good. Will definitely repurchase.",
    "Perfect product! Gentle on my sensitive skin and works brilliantly.",
  ],
  4: [
    "Really good product. Noticed visible improvement in a few days.",
    "Nice texture and pleasant scent. Works as described.",
    "Good value for money. Will buy again.",
    "Effective and easy to use. Skin feels softer already.",
    "Works well for my skin type. A bit pricey but worth it.",
  ],
  3: [
    "Decent product but expected more for the price.",
    "Average results. May work better for other skin types.",
    "It's okay. Did not see dramatic changes but not bad.",
    "Neutral experience. Packaging could be better.",
    "Mildly effective. Still giving it more time.",
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
  ],
};

function generateReviews(productId: string, avgRating: number, reviewCount: number) {
  // Cap at 8 seeded reviews per product to keep the seed manageable
  const count = Math.min(reviewCount, 8);
  const reviews = [];
  for (let i = 0; i < count; i++) {
    // Distribute ratings around avgRating using small jitter
    const jitter = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
    const rating = Math.max(1, Math.min(5, Math.round(avgRating) + jitter));
    const templates = REVIEW_TEMPLATES[rating];
    const comment = templates[Math.floor(Math.random() * templates.length)];
    const reviewer_name = REVIEWER_NAMES[Math.floor(Math.random() * REVIEWER_NAMES.length)];
    // Stagger created_at over the past 6 months
    const daysAgo = Math.floor(Math.random() * 180);
    const created_at = new Date(Date.now() - daysAgo * 86400000).toISOString();
    reviews.push({ product_id: productId, reviewer_name, rating, comment, created_at });
  }
  return reviews;
}

// ─── API Types ────────────────────────────────────────────────────────────────

interface VirginCodesVariant {
  currentPrice: number;
  originalPrice: number;
  inventoryQuantity: number;
}

interface VirginCodesAttributeValue {
  productAttribute: { code: string; title: string };
  productAttributeValue: { value: string };
}

interface VirginCodesCategory {
  category: {
    name: string;
    handle: string;
    parent: { name: string; handle: string } | null;
  };
}

interface VirginCodesTag {
  tag: { title: string };
}

interface VirginCodesImage {
  image: string;
}

interface VirginCodesProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  thumbnail: string | null;
  averageRating: number;
  reviewsCount: number;
  brand: { title: string } | null;
  productCategories: VirginCodesCategory[];
  productValuesForAttribute: VirginCodesAttributeValue[];
  tags: VirginCodesTag[];
  variants: VirginCodesVariant[];
  productImages: VirginCodesImage[];
  priceStart: number;
}

interface ApiResponse {
  data: { products: VirginCodesProduct[] };
  meta: { total: number; lastPage: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeSlug(handle: string): string {
  return handle
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 255);
}

function fetchJson(url: string): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let raw = "";
      res.on("data", (chunk: Buffer) => (raw += chunk.toString()));
      res.on("end", () => {
        try {
          resolve(JSON.parse(raw) as ApiResponse);
        } catch (e) {
          reject(e);
        }
      });
      res.on("error", reject);
    });
  });
}

// ─── Mapping ─────────────────────────────────────────────────────────────────

function mapProduct(p: VirginCodesProduct, slugSuffix: string) {
  const variant = p.variants?.[0];
  const price = variant?.currentPrice ?? p.priceStart ?? 0;
  const originalPrice = variant?.originalPrice ?? price;

  const category =
    p.productValuesForAttribute.find((v) => v.productAttribute.code === "PRODUCT_TYPE")
      ?.productAttributeValue.value ??
    p.productCategories.find((pc) => pc.category.parent?.handle === "product-type")
      ?.category.name ??
    p.productCategories[0]?.category.name ??
    "Skincare";

  const inventoryQty = Math.max(0, variant?.inventoryQuantity ?? 0);
  const availability =
    inventoryQty > 10 ? "in_stock" : inventoryQty > 0 ? "low_stock" : "out_of_stock";

  const images: { url: string; alt: string }[] = [];
  if (p.thumbnail) images.push({ url: IMAGE_BASE + p.thumbnail, alt: p.title });
  for (const img of p.productImages ?? []) {
    const url = IMAGE_BASE + img.image;
    if (!images.some((i) => i.url === url)) images.push({ url, alt: p.title });
  }
  if (images.length === 0) return null; // skip products with no images

  const specs: Record<string, string> = {};
  for (const attr of p.productValuesForAttribute) {
    const key = attr.productAttribute.title;
    const val = attr.productAttributeValue.value;
    specs[key] = specs[key] ? `${specs[key]}, ${val}` : val;
  }

  return {
    sku: p.id.slice(0, 100),
    name: p.title.slice(0, 255),
    slug: (sanitizeSlug(p.handle) + slugSuffix).slice(0, 255),
    description: stripHtml(p.description).slice(0, 5000),
    price,
    compare_at_price: originalPrice > price ? originalPrice : null,
    images: images.slice(0, 5),
    category: category.slice(0, 100),
    brand: (p.brand?.title ?? "Unknown").slice(0, 100),
    tags: (p.tags ?? []).slice(0, 15).map((t) => t.tag.title).filter((t) => t.length <= 50),
    availability,
    stock_quantity: inventoryQty,
    rating: p.averageRating ?? 0,
    rating_count: p.reviewsCount ?? 0,
    specifications: specs,
  };
}

// ─── Fetch all pages from the API ────────────────────────────────────────────

async function fetchAllProducts(): Promise<VirginCodesProduct[]> {
  console.log("Fetching page 1...");
  const first = await fetchJson(`${API_BASE}&page=1`);
  const lastPage = Math.min(first.meta?.lastPage ?? 1, MAX_PAGES);
  const all: VirginCodesProduct[] = [...(first.data?.products ?? [])];
  console.log(`  Page 1/${lastPage}: ${all.length} products (store total: ${first.meta?.total})`);

  for (let page = 2; page <= lastPage; page++) {
    const resp = await fetchJson(`${API_BASE}&page=${page}`);
    const batch = resp.data?.products ?? [];
    all.push(...batch);
    console.log(`  Page ${page}/${lastPage}: ${batch.length} fetched, ${all.length} total`);
    await new Promise((r) => setTimeout(r, 200));
  }

  // Deduplicate by handle before mapping
  const seen = new Set<string>();
  return all.filter((p) => (seen.has(p.handle) ? false : (seen.add(p.handle), true)));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("=== Beauty Barn Product Seed ===\n");

  const raw = await fetchAllProducts();
  console.log(`\nFetched ${raw.length} unique products from API`);

  // Resolve slug collisions by appending a counter suffix
  const slugCount = new Map<string, number>();
  const products = raw
    .map((p) => {
      const baseSlug = sanitizeSlug(p.handle);
      const n = (slugCount.get(baseSlug) ?? 0) + 1;
      slugCount.set(baseSlug, n);
      return mapProduct(p, n > 1 ? `-${n}` : "");
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const skipped = raw.length - products.length;
  if (skipped > 0) console.log(`Skipped ${skipped} products with no images`);
  console.log(`Upserting ${products.length} products into Supabase...\n`);

  // Single upsert per batch — conflict on `sku` so reruns update instead of fail
  let inserted = 0;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("products")
      .upsert(batch, { onConflict: "sku" });

    if (error) {
      console.error(`  Batch ${i}–${i + batch.length - 1} failed: ${error.message}`);
    } else {
      inserted += batch.length;
      console.log(`  Batch ${i + 1}–${i + batch.length} upserted (${inserted}/${products.length})`);
    }
  }

  console.log(`\nDone! ${inserted} products upserted.`);

  // ─── Seed reviews ────────────────────────────────────────────────────────
  // Fetch the upserted products to get their UUIDs and source rating data
  const { data: dbProducts, error: fetchErr } = await supabase
    .from("products")
    .select("id, sku, rating, rating_count");

  if (fetchErr) {
    console.error("Could not fetch products for review seeding:", fetchErr.message);
    return;
  }

  // Build a map from sku -> { id, rating, rating_count }
  const skuMap = new Map(
    (dbProducts ?? []).map((p: { id: string; sku: string; rating: number; rating_count: number }) => [
      p.sku,
      { id: p.id, rating: p.rating, rating_count: p.rating_count },
    ])
  );

  // Check if reviews table already has rows (avoid duplicating on re-run)
  const { count: existingReviewCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true });

  if ((existingReviewCount ?? 0) > 0) {
    console.log(`\nSkipped review seeding — ${existingReviewCount} reviews already exist.`);
    return;
  }

  const allReviews: {
    product_id: string;
    reviewer_name: string;
    rating: number;
    comment: string;
    created_at: string;
  }[] = [];

  for (const p of raw) {
    const entry = skuMap.get(p.id.slice(0, 100));
    if (!entry || entry.rating_count === 0) continue;
    const reviews = generateReviews(entry.id, entry.rating, entry.rating_count);
    allReviews.push(...reviews);
  }

  console.log(`\nSeeding ${allReviews.length} reviews...`);

  let reviewsInserted = 0;
  for (let i = 0; i < allReviews.length; i += BATCH_SIZE) {
    const batch = allReviews.slice(i, i + BATCH_SIZE);
    const { error: revErr } = await supabase.from("reviews").insert(batch);
    if (revErr) {
      console.error(`  Reviews batch ${i}–${i + batch.length - 1} failed: ${revErr.message}`);
    } else {
      reviewsInserted += batch.length;
      console.log(`  Reviews batch ${i + 1}–${i + batch.length} inserted (${reviewsInserted}/${allReviews.length})`);
    }
  }

  console.log(`\nDone! ${reviewsInserted} reviews seeded.`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
