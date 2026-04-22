export type Availability = "in_stock" | "out_of_stock" | "low_stock";

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  images: ProductImage[];
  category: string;
  brand: string;
  tags: string[];
  availability: Availability;
  stock_quantity: number;
  rating: number;
  rating_count: number;
  specifications: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ProductWithReviews extends Product {
  reviews: Review[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  status: number;
}
