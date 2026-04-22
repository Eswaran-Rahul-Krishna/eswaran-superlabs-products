import { NextRequest, NextResponse } from "next/server";
import {
  getProductByIdOrSlug,
  updateProduct,
  deleteProduct,
} from "@/lib/repositories/product.repository";
import { UpdateProductSchema } from "@/lib/validators";
import {
  unauthorized,
  badRequest,
  notFound,
  serverError,
  validateAdminToken,
} from "@/lib/api-helpers";

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product detail by ID or slug
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product UUID or slug
 *     responses:
 *       200:
 *         description: Product with reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductWithReviews'
 *       404:
 *         description: Product not found
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const product = await getProductByIdOrSlug(id);
    if (!product) return notFound("Product not found");
    return NextResponse.json(product);
  } catch {
    return serverError();
  }
}

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update a product
 *     security:
 *       - AdminBearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Updated product
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAdminToken(request.headers.get("Authorization"))) {
    return unauthorized();
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = UpdateProductSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0].message);
  }

  try {
    const existing = await getProductByIdOrSlug(id);
    if (!existing) return notFound("Product not found");

    const updated = await updateProduct(id, parsed.data);
    return NextResponse.json(updated);
  } catch {
    return serverError();
  }
}

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a product
 *     security:
 *       - AdminBearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateAdminToken(request.headers.get("Authorization"))) {
    return unauthorized();
  }

  const { id } = await params;

  try {
    const existing = await getProductByIdOrSlug(id);
    if (!existing) return notFound("Product not found");

    await deleteProduct(id);
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch {
    return serverError();
  }
}
