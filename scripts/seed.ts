import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const seedProducts = [
  {
    sku: "ELEC-001",
    name: "ProBook X500 Laptop",
    slug: "probook-x500-laptop",
    description: "High-performance laptop with Intel Core i7, 16GB RAM, 512GB SSD, 15.6-inch FHD display. Ideal for professionals and creators.",
    price: 74999,
    compare_at_price: 89999,
    images: [
      { url: "https://picsum.photos/seed/laptop1/600/600", alt: "ProBook X500 front view" },
      { url: "https://picsum.photos/seed/laptop2/600/600", alt: "ProBook X500 side view" },
    ],
    category: "Electronics",
    brand: "ProBook",
    tags: ["laptop", "intel", "i7", "ssd"],
    availability: "in_stock" as const,
    stock_quantity: 45,
    rating: 4.5,
    rating_count: 128,
    specifications: {
      Processor: "Intel Core i7-12th Gen",
      RAM: "16GB DDR5",
      Storage: "512GB NVMe SSD",
      Display: "15.6\" FHD IPS",
      Battery: "72Wh, up to 10hrs",
      OS: "Windows 11 Home",
      Weight: "1.8kg",
    },
  },
  {
    sku: "ELEC-002",
    name: "UltraPhone Z12 Pro",
    slug: "ultraphone-z12-pro",
    description: "Flagship smartphone with 6.7-inch AMOLED, 200MP camera, 5000mAh battery, and 5G connectivity.",
    price: 59999,
    compare_at_price: 69999,
    images: [
      { url: "https://picsum.photos/seed/phone1/600/600", alt: "UltraPhone Z12 Pro front" },
      { url: "https://picsum.photos/seed/phone2/600/600", alt: "UltraPhone Z12 Pro back" },
    ],
    category: "Electronics",
    brand: "UltraPhone",
    tags: ["smartphone", "5g", "camera", "amoled"],
    availability: "in_stock" as const,
    stock_quantity: 120,
    rating: 4.7,
    rating_count: 342,
    specifications: {
      Display: "6.7\" AMOLED 120Hz",
      Camera: "200MP + 12MP + 10MP",
      Battery: "5000mAh, 65W fast charge",
      Processor: "Snapdragon 8 Gen 3",
      RAM: "12GB",
      Storage: "256GB",
      Connectivity: "5G, WiFi 7, Bluetooth 5.4",
    },
  },
  {
    sku: "ELEC-003",
    name: "SoundMax Pro Wireless Headphones",
    slug: "soundmax-pro-wireless-headphones",
    description: "Premium noise-cancelling headphones with 40-hour battery life, Hi-Res Audio, and multipoint connection.",
    price: 14999,
    compare_at_price: 19999,
    images: [
      { url: "https://picsum.photos/seed/headphone1/600/600", alt: "SoundMax Pro headphones" },
    ],
    category: "Electronics",
    brand: "SoundMax",
    tags: ["headphones", "wireless", "noise-cancelling", "audio"],
    availability: "in_stock" as const,
    stock_quantity: 200,
    rating: 4.6,
    rating_count: 87,
    specifications: {
      "Driver Size": "40mm",
      "Frequency Response": "20Hz - 20kHz",
      Battery: "40 hours ANC on",
      Connectivity: "Bluetooth 5.3, 3.5mm jack",
      Weight: "250g",
      "Noise Cancellation": "Active (ANC)",
    },
  },
  {
    sku: "ELEC-004",
    name: "SmartWatch Series 8",
    slug: "smartwatch-series-8",
    description: "Advanced smartwatch with health monitoring, GPS, blood oxygen sensor, and 2-day battery life.",
    price: 24999,
    compare_at_price: null,
    images: [
      { url: "https://picsum.photos/seed/watch1/600/600", alt: "SmartWatch Series 8" },
    ],
    category: "Electronics",
    brand: "TechWear",
    tags: ["smartwatch", "fitness", "gps", "health"],
    availability: "low_stock" as const,
    stock_quantity: 12,
    rating: 4.3,
    rating_count: 56,
    specifications: {
      Display: "1.9\" AMOLED Always-On",
      Battery: "2 days typical use",
      Sensors: "Heart rate, SpO2, ECG, GPS",
      Water: "5ATM water resistance",
      Connectivity: "Bluetooth 5.2, WiFi",
      Compatibility: "iOS 16+, Android 10+",
    },
  },
  {
    sku: "CLOTH-001",
    name: "Urban Slim Fit Jacket",
    slug: "urban-slim-fit-jacket",
    description: "Versatile slim-fit jacket made from premium recycled polyester. Water-resistant and windproof.",
    price: 3999,
    compare_at_price: 5499,
    images: [
      { url: "https://picsum.photos/seed/jacket1/600/600", alt: "Urban slim fit jacket" },
      { url: "https://picsum.photos/seed/jacket2/600/600", alt: "Jacket side view" },
    ],
    category: "Clothing",
    brand: "UrbanWear",
    tags: ["jacket", "slim-fit", "water-resistant", "recycled"],
    availability: "in_stock" as const,
    stock_quantity: 85,
    rating: 4.4,
    rating_count: 43,
    specifications: {
      Material: "100% Recycled Polyester",
      Fit: "Slim Fit",
      Water: "DWR Water Resistant",
      Sizes: "XS, S, M, L, XL, XXL",
      Care: "Machine wash cold",
    },
  },
  {
    sku: "CLOTH-002",
    name: "Classic Polo T-Shirt",
    slug: "classic-polo-t-shirt",
    description: "Premium pique cotton polo shirt with embroidered logo. Perfect for casual and semi-formal occasions.",
    price: 1299,
    compare_at_price: 1799,
    images: [
      { url: "https://picsum.photos/seed/polo1/600/600", alt: "Classic polo t-shirt" },
    ],
    category: "Clothing",
    brand: "ClassicWear",
    tags: ["polo", "cotton", "casual", "formal"],
    availability: "in_stock" as const,
    stock_quantity: 250,
    rating: 4.2,
    rating_count: 191,
    specifications: {
      Material: "100% Pique Cotton",
      Fit: "Regular Fit",
      Collar: "Ribbed polo collar",
      Sizes: "S, M, L, XL, XXL",
      Care: "Machine wash warm",
    },
  },
  {
    sku: "CLOTH-003",
    name: "Stretch Chino Pants",
    slug: "stretch-chino-pants",
    description: "Modern stretch chino pants with 4-way stretch fabric. Comfortable all-day wear for office or casual.",
    price: 2499,
    compare_at_price: null,
    images: [
      { url: "https://picsum.photos/seed/chino1/600/600", alt: "Stretch chino pants" },
    ],
    category: "Clothing",
    brand: "UrbanWear",
    tags: ["pants", "chino", "stretch", "office"],
    availability: "in_stock" as const,
    stock_quantity: 160,
    rating: 4.1,
    rating_count: 67,
    specifications: {
      Material: "97% Cotton, 3% Elastane",
      Fit: "Slim Fit",
      Waist: "28\" to 38\"",
      Rise: "Mid Rise",
      Care: "Machine wash cold",
    },
  },
  {
    sku: "HOME-001",
    name: "AeroBreeze Tower Fan",
    slug: "aerobreeze-tower-fan",
    description: "Quiet 3-speed tower fan with sleep timer, remote control, and 70° oscillation. Energy efficient DC motor.",
    price: 8999,
    compare_at_price: 11999,
    images: [
      { url: "https://picsum.photos/seed/fan1/600/600", alt: "AeroBreeze tower fan" },
    ],
    category: "Home & Appliances",
    brand: "AeroBreeze",
    tags: ["fan", "tower", "remote", "silent"],
    availability: "in_stock" as const,
    stock_quantity: 35,
    rating: 4.0,
    rating_count: 28,
    specifications: {
      Speeds: "3 speed settings",
      Oscillation: "70° auto oscillation",
      Timer: "1-8 hour sleep timer",
      Noise: "< 45dB at max speed",
      Height: "120cm",
      Power: "45W DC Motor",
    },
  },
  {
    sku: "HOME-002",
    name: "BrewMaster Coffee Machine",
    slug: "brewmaster-coffee-machine",
    description: "Automatic drip coffee maker with built-in grinder, thermal carafe, and programmable brewing schedule.",
    price: 12999,
    compare_at_price: 15999,
    images: [
      { url: "https://picsum.photos/seed/coffee1/600/600", alt: "BrewMaster coffee machine" },
      { url: "https://picsum.photos/seed/coffee2/600/600", alt: "Coffee machine detail" },
    ],
    category: "Home & Appliances",
    brand: "BrewMaster",
    tags: ["coffee", "grinder", "automatic", "thermal"],
    availability: "in_stock" as const,
    stock_quantity: 55,
    rating: 4.8,
    rating_count: 112,
    specifications: {
      Capacity: "1.5L thermal carafe",
      Grinder: "Built-in conical burr grinder",
      Programs: "24hr programmable timer",
      Brewing: "6-12 cups",
      Wattage: "1100W",
      Dimensions: "32 x 22 x 40cm",
    },
  },
  {
    sku: "HOME-003",
    name: "SmartClean Robot Vacuum",
    slug: "smartclean-robot-vacuum",
    description: "AI-powered robot vacuum with lidar mapping, auto-empty dock, and 3000Pa suction. Works with Alexa & Google.",
    price: 29999,
    compare_at_price: 39999,
    images: [
      { url: "https://picsum.photos/seed/vacuum1/600/600", alt: "SmartClean robot vacuum" },
    ],
    category: "Home & Appliances",
    brand: "SmartClean",
    tags: ["robot-vacuum", "ai", "alexa", "lidar"],
    availability: "low_stock" as const,
    stock_quantity: 8,
    rating: 4.6,
    rating_count: 74,
    specifications: {
      Suction: "3000Pa",
      Navigation: "LiDAR SLAM",
      Battery: "5200mAh, 180min runtime",
      "Dust Bin": "400ml (auto-empty dock: 2.5L)",
      Smart: "Alexa, Google Assistant",
      Mapping: "Multi-floor mapping",
    },
  },
  {
    sku: "SPORT-001",
    name: "FlexRun Pro Running Shoes",
    slug: "flexrun-pro-running-shoes",
    description: "Lightweight responsive running shoes with carbon fibre plate, energy-return foam, and breathable mesh upper.",
    price: 9999,
    compare_at_price: 12999,
    images: [
      { url: "https://picsum.photos/seed/shoe1/600/600", alt: "FlexRun Pro shoes" },
      { url: "https://picsum.photos/seed/shoe2/600/600", alt: "FlexRun Pro sole" },
    ],
    category: "Sports",
    brand: "FlexRun",
    tags: ["running", "shoes", "carbon", "lightweight"],
    availability: "in_stock" as const,
    stock_quantity: 95,
    rating: 4.7,
    rating_count: 203,
    specifications: {
      Upper: "Engineered knit mesh",
      Midsole: "ReactFoam + Carbon plate",
      Outsole: "Durable rubber traction",
      Drop: "8mm",
      Weight: "245g (size 9)",
      Sizes: "UK 6-13",
    },
  },
  {
    sku: "SPORT-002",
    name: "HydroFlask Pro 32oz",
    slug: "hydroflask-pro-32oz",
    description: "Double-wall vacuum insulated stainless steel bottle. Keeps drinks cold 24hrs, hot 12hrs. Leak-proof lid.",
    price: 2499,
    compare_at_price: null,
    images: [
      { url: "https://picsum.photos/seed/bottle1/600/600", alt: "HydroFlask Pro bottle" },
    ],
    category: "Sports",
    brand: "HydroFlask",
    tags: ["bottle", "insulated", "stainless", "leak-proof"],
    availability: "in_stock" as const,
    stock_quantity: 300,
    rating: 4.9,
    rating_count: 456,
    specifications: {
      Capacity: "32oz / 946ml",
      Material: "18/8 Stainless Steel",
      Insulation: "Double-wall vacuum",
      Cold: "Up to 24 hours",
      Hot: "Up to 12 hours",
      Lid: "Flex cap, leak-proof",
      BPA: "BPA-free",
    },
  },
  {
    sku: "ELEC-005",
    name: "4K UltraHD Monitor 27\"",
    slug: "4k-uhd-monitor-27",
    description: "27-inch 4K IPS monitor with 144Hz refresh rate, HDR400, USB-C 90W charging, and factory calibrated display.",
    price: 34999,
    compare_at_price: 44999,
    images: [
      { url: "https://picsum.photos/seed/monitor1/600/600", alt: "4K monitor front" },
    ],
    category: "Electronics",
    brand: "ViewPro",
    tags: ["monitor", "4k", "144hz", "usb-c", "hdr"],
    availability: "in_stock" as const,
    stock_quantity: 22,
    rating: 4.5,
    rating_count: 67,
    specifications: {
      Resolution: "3840 x 2160 (4K UHD)",
      Panel: "IPS, 99% sRGB",
      "Refresh Rate": "144Hz",
      HDR: "HDR400",
      Ports: "2x HDMI 2.1, 1x DP 1.4, USB-C 90W",
      Response: "1ms GtG",
    },
  },
  {
    sku: "ELEC-006",
    name: "MechaType K85 Keyboard",
    slug: "mechatype-k85-keyboard",
    description: "Compact TKL mechanical keyboard with hot-swap switches, per-key RGB, aluminium frame and wireless mode.",
    price: 7999,
    compare_at_price: 9999,
    images: [
      { url: "https://picsum.photos/seed/keyboard1/600/600", alt: "MechaType keyboard" },
    ],
    category: "Electronics",
    brand: "MechaType",
    tags: ["keyboard", "mechanical", "rgb", "wireless", "hot-swap"],
    availability: "in_stock" as const,
    stock_quantity: 77,
    rating: 4.6,
    rating_count: 88,
    specifications: {
      Layout: "85% TKL",
      Switches: "Hot-swappable (Gateron included)",
      Backlight: "Per-key RGB",
      Frame: "Aluminium CNC",
      Connectivity: "USB-C, 2.4GHz, Bluetooth 5.1",
      Battery: "4000mAh",
    },
  },
  {
    sku: "HOME-004",
    name: "AirPure Smart Air Purifier",
    slug: "airpure-smart-air-purifier",
    description: "True HEPA + activated carbon filter, covers 500 sq ft, real-time AQI display, and auto mode via app.",
    price: 18999,
    compare_at_price: 23999,
    images: [
      { url: "https://picsum.photos/seed/purifier1/600/600", alt: "AirPure air purifier" },
    ],
    category: "Home & Appliances",
    brand: "AirPure",
    tags: ["air-purifier", "hepa", "smart", "app"],
    availability: "out_of_stock" as const,
    stock_quantity: 0,
    rating: 4.4,
    rating_count: 39,
    specifications: {
      Coverage: "500 sq ft",
      Filter: "True HEPA H13 + Activated Carbon",
      CADR: "350 m³/h",
      Noise: "22dB on quiet mode",
      Smart: "WiFi, App control, Voice assistant",
      Display: "Real-time AQI",
    },
  },
];

const seedReviews = [
  { reviewer_name: "Arun K", rating: 5, comment: "Excellent product! Exceeded my expectations." },
  { reviewer_name: "Priya M", rating: 4, comment: "Very good quality. Fast delivery too." },
  { reviewer_name: "Rahul S", rating: 5, comment: "Worth every rupee. Highly recommended." },
  { reviewer_name: "Sneha R", rating: 4, comment: "Good product, packaging could be better." },
  { reviewer_name: "Vikram P", rating: 3, comment: "Decent quality. Gets the job done." },
];

async function seed() {
  console.log("Seeding products...");

  for (const product of seedProducts) {
    const { data, error } = await supabase
      .from("products")
      .upsert(product, { onConflict: "sku" })
      .select()
      .single();

    if (error) {
      console.error(`Failed to seed ${product.sku}:`, error.message);
      continue;
    }

    const reviews = seedReviews
      .slice(0, Math.floor(Math.random() * 3) + 2)
      .map((r) => ({ ...r, product_id: data.id }));

    const { error: reviewError } = await supabase
      .from("reviews")
      .upsert(reviews, { onConflict: "id" });

    if (reviewError) {
      console.error(`Failed to seed reviews for ${product.sku}:`, reviewError.message);
    } else {
      console.log(`Seeded: ${product.name}`);
    }
  }

  console.log("Done seeding.");
}

seed().catch(console.error);
