import { NextRequest, NextResponse } from "next/server";
import {
  searchProducts,
  createProduct,
} from "@/lib/repositories/product.repository";
import {
  SearchQuerySchema,
  CreateProductSchema,
} from "@/lib/validators";
import {
  unauthorized,
  badRequest,
  serverError,
  validateAdminToken,
} from "@/lib/api-helpers";

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Search and list products with pagination
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated product list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedProducts'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const parsed = SearchQuerySchema.safeParse({
    q: searchParams.get("q") ?? "",
    page: searchParams.get("page") ?? 1,
    limit: searchParams.get("limit") ?? 12,
    category: searchParams.get("category") ?? undefined,
  });

  if (!parsed.success) {
    return badRequest(parsed.error.issues[0].message);
  }

  try {
    const result = await searchProducts(
      parsed.data.q,
      parsed.data.page,
      parsed.data.limit,
      parsed.data.category
    );
    return NextResponse.json(result);
  } catch {
    return serverError();
  }
}

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Admin]
 *     summary: Create a new product
 *     security:
 *       - AdminBearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  if (!validateAdminToken(request.headers.get("Authorization"))) {
    return unauthorized();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = CreateProductSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0].message);
  }

  try {
    const product = await createProduct(parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("duplicate")) {
      return badRequest("SKU or slug already exists");
    }
    return serverError();
  }
}
