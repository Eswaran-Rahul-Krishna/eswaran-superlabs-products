content = r'''import { createClient } from "@supabase/supabase-js";
import * as https from "https";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const IMAGE_BASE = "https://virgincodes.com/";
const API_URL =
  "https://virgincodes.com/api/v1/store/product-search?page=1&limit=20&inStock=false";

interface VirginCodesVariant {
  price: number;
  originalPrice: number;
  currentPrice: number;
  specialPrice: number | null;
  specialPriceActive: number | null;
  inventoryQuantity: number;
}

interface VirginCodesAttributeValue {
  value: string | null;
  productAttribute: { code: string; title: string };
  productAttributeValue: { value: string };
}

interface VirginCodesCategory {
  category: {
    id: string;
    name: string;
    handle: string;
    parent: { name: string; handle: string } | null;
  };
}

interface VirginCodesTag {
  tag: { id: string; title: string; slug: string };
}

interface VirginCodesImage {
  id: string;
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
  brand: { id: string; handle: string; title: string } | null;
  productCategories: VirginCodesCategory[];
  productValuesForAttribute: VirginCodesAttributeValue[];
  tags: VirginCodesTag[];
  variants: VirginCodesVariant[];
  productImages: VirginCodesImage[];
  priceStart: number;
}

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

function mapProduct(p: VirginCodesProduct) {
  const variant = p.variants?.[0];
  const price = variant?.currentPrice ?? p.priceStart ?? 0;
  const originalPrice = variant?.originalPrice ?? price;

  const productTypeAttrs = p.productValuesForAttribute
    .filter((v) => v.productAttribute.code === "PRODUCT_TYPE")
    .map((v) => v.productAttributeValue.value);

  const category =
    productTypeAttrs[0] ??
    p.productCategories.find(
      (pc) => pc.category.parent?.handle === "product-type"
    )?.category.name ??
    p.productCategories[0]?.category.name ??
    "Skincare";

  const inventoryQty = variant?.inventoryQuantity ?? 0;
  const availability =
    inventoryQty > 10
      ? "in_stock"
      : inventoryQty > 0
      ? "low_stock"
      : "out_of_stock";

  const images: { url: string; alt: string }[] = [];
  if (p.thumbnail) {
    images.push({ url: IMAGE_BASE + p.thumbnail, alt: p.title });
  }
  for (const img of p.productImages ?? []) {
    const imgUrl = IMAGE_BASE + img.image;
    if (!images.some((i) => i.url === imgUrl)) {
      images.push({ url: imgUrl, alt: p.title });
    }
  }
  if (images.length === 0) {
    images.push({
      url: `https://picsum.photos/seed/${p.handle}/600/600`,
      alt: p.title,
    });
  }

  const specs: Record<string, string> = {};
  for (const attr of p.productValuesForAttribute) {
    const code = attr.productAttribute.title;
    const val = attr.productAttributeValue.value;
    if (specs[code]) {
      specs[code] += ", " + val;
    } else {
      specs[code] = val;
    }
  }

  const tags = (p.tags ?? [])
    .slice(0, 15)
    .map((t) => t.tag.title)
    .filter((t) => t.length <= 50);

  const slug = sanitizeSlug(p.handle);
  const sku = p.handle.slice(0, 100);

  return {
    sku,
    name: p.title.slice(0, 255),
    slug,
    description: stripHtml(p.description).slice(0, 5000),
    price,
    compare_at_price: originalPrice > price ? originalPrice : null,
    images: images.slice(0, 5),
    category: category.slice(0, 100),
    brand: (p.brand?.title ?? "Unknown").slice(0, 100),
    tags,
    availability,
    stock_quantity: inventoryQty,
    rating: p.averageRating ?? 0,
    rating_count: p.reviewsCount ?? 0,
    specifications: specs,
  };
}

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk: Buffer) => (data += chunk.toString()));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
      res.on("error", reject);
    });
  });
}

async function seed() {
  console.log("Fetching products from virgincodes.com API...");

  const response = (await fetchJson(API_URL)) as {
    data: { products: VirginCodesProduct[] };
  };

  const rawProducts = response?.data?.products ?? [];
  console.log(`Fetched ${rawProducts.length} products`);

  if (rawProducts.length === 0) {
    console.error("No products returned from API");
    process.exit(1);
  }

  const products = rawProducts.map(mapProduct);

  console.log("Clearing existing products...");
  const { error: truncateError } = await supabase
    .from("products")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (truncateError) {
    console.error("Error clearing products:", truncateError);
    process.exit(1);
  }

  console.log("Seeding products...");
  for (const product of products) {
    const { error } = await supabase.from("products").insert(product);
    if (error) {
      console.error(`Failed to insert "${product.name}":`, error.message);
    } else {
      console.log(`  + ${product.name} (${product.brand})`);
    }
  }

  console.log(`\nDone! Seeded ${products.length} products.`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
'''

with open(r'C:\Users\ASUS\eswaran-superlabs-products\scripts\seed.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Written seed.ts successfully')
