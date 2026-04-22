import { createSwaggerSpec } from "next-swagger-doc";

export function getApiSpec() {
  return createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "SuperLabs Product API",
        version: "1.0.0",
        description:
          "REST API for the SuperLabs eCommerce product listing service. Built by Eswaran.",
        contact: {
          name: "Eswaran",
        },
      },
      tags: [
        { name: "Products", description: "Product search and detail endpoints" },
        { name: "Admin", description: "Admin product management endpoints" },
      ],
      components: {
        securitySchemes: {
          AdminBearer: {
            type: "http",
            scheme: "bearer",
            description: "Admin secret token required for write operations",
          },
        },
        schemas: {
          ProductImage: {
            type: "object",
            properties: {
              url: { type: "string", format: "uri" },
              alt: { type: "string" },
            },
          },
          Product: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              sku: { type: "string" },
              name: { type: "string" },
              slug: { type: "string" },
              description: { type: "string" },
              price: { type: "number" },
              compare_at_price: { type: "number", nullable: true },
              images: {
                type: "array",
                items: { $ref: "#/components/schemas/ProductImage" },
              },
              category: { type: "string" },
              brand: { type: "string" },
              tags: { type: "array", items: { type: "string" } },
              availability: {
                type: "string",
                enum: ["in_stock", "out_of_stock", "low_stock"],
              },
              stock_quantity: { type: "integer" },
              rating: { type: "number" },
              rating_count: { type: "integer" },
              specifications: { type: "object" },
              created_at: { type: "string", format: "date-time" },
              updated_at: { type: "string", format: "date-time" },
            },
          },
          PaginatedProducts: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: { $ref: "#/components/schemas/Product" },
              },
              total: { type: "integer" },
              page: { type: "integer" },
              limit: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
          Error: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
  });
}
