import { NextRequest, NextResponse } from "next/server";
import {
  getProductByIdOrSlug,
  getReviewsByProductId,
  createReview,
} from "@/lib/repositories/product.repository";
import {
  notFound,
  badRequest,
  serverError,
} from "@/lib/api-helpers";
import { z } from "zod";

const CreateReviewSchema = z.object({
  reviewer_name: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
});

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   get:
 *     tags: [Products]
 *     summary: Get reviews for a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product UUID or slug
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
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

    const reviews = await getReviewsByProductId(product.id);
    return NextResponse.json(reviews);
  } catch {
    return serverError();
  }
}

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   post:
 *     tags: [Products]
 *     summary: Submit a review for a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product UUID or slug
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReview'
 *     responses:
 *       201:
 *         description: Created review
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = CreateReviewSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0].message);
  }

  try {
    const product = await getProductByIdOrSlug(id);
    if (!product) return notFound("Product not found");

    const review = await createReview({
      product_id: product.id,
      reviewer_name: parsed.data.reviewer_name,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    return NextResponse.json(review, { status: 201 });
  } catch {
    return serverError();
  }
}
