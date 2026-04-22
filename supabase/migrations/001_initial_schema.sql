-- Run this in Supabase SQL Editor before seeding

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Products table
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku varchar(100) unique not null,
  name varchar(255) not null,
  slug varchar(255) unique not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2) check (compare_at_price >= 0),
  images jsonb not null default '[]',
  category varchar(100) not null,
  brand varchar(100) not null,
  tags text[] not null default '{}',
  availability varchar(20) not null default 'in_stock'
    check (availability in ('in_stock', 'out_of_stock', 'low_stock')),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  rating numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  specifications jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reviews table
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  reviewer_name varchar(100) not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

-- Indexes for search performance
create index if not exists idx_products_name on products using gin(to_tsvector('english', name));
create index if not exists idx_products_slug on products (slug);
create index if not exists idx_products_sku on products (sku);
create index if not exists idx_products_category on products (category);
create index if not exists idx_reviews_product_id on reviews (product_id);

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger products_updated_at
  before update on products
  for each row execute function update_updated_at_column();

-- Enable Row Level Security
alter table products enable row level security;
alter table reviews enable row level security;

-- Public read access
create policy "Public can read products"
  on products for select using (true);

create policy "Public can read reviews"
  on reviews for select using (true);

-- Service role has full access (bypasses RLS automatically)
