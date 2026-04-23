# SuperLabs Products — Backend Developer Task 2026

A full-stack eCommerce product listing service built with **Next.js 16 (App Router)**, **TypeScript**, **PostgreSQL (Supabase)**, and deployed on **Vercel**.

## Live Demo

> Add your Vercel URL here after deployment.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL via Supabase |
| Styling | Tailwind CSS v4 |
| Validation | Zod |
| API Docs | Swagger UI / OpenAPI 3.0 |
| Deployment | Vercel |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | Search & list products with pagination and filters |
| GET | `/api/products/:id` | Product detail with embedded reviews |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| GET | `/api/products/:id/reviews` | Get reviews for a product |
| POST | `/api/products/:id/reviews` | Submit a review |
| GET | `/api/filters` | Get available categories & brands |
| GET | `/api/docs` | OpenAPI JSON spec |

## Pages

| Path | Description |
|---|---|
| `/` | Search page — product listing with filters, pagination, infinite scroll |
| `/products/:slug` | Product detail page — images, specs, reviews |
| `/admin` | Admin product management — create, edit, delete |
| `/docs` | Interactive Swagger UI API documentation |

## Local Development

```bash
# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env.local

# Run dev server
npm run dev
```

## Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_SECRET=
```

## Admin Access

The admin interface at `/admin` uses Next.js Server Actions with `ADMIN_SECRET` stored as a server-only environment variable. No secret is exposed to the client bundle.
