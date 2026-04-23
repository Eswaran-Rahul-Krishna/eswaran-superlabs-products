// Fully inline OpenAPI spec — avoids next-swagger-doc's file scanning which
// fails on Vercel serverless (source files aren't present at runtime).
export function getApiSpec() {
  return {
    openapi: "3.0.0",
    info: {
      title: "SuperLabs Product API",
      version: "1.0.0",
      description:
        "REST API for the SuperLabs eCommerce product listing service. Built by Eswaran.",
      contact: { name: "Eswaran" },
    },
    tags: [
      { name: "Products", description: "Product search and detail endpoints" },
      { name: "Admin", description: "Admin product management endpoints" },
      { name: "Filters", description: "Filter option endpoints" },
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
        FiltersResponse: {
          type: "object",
          properties: {
            categories: { type: "array", items: { type: "string" } },
            brands: { type: "array", items: { type: "string" } },
          },
        },
        Error: {
          type: "object",
          properties: { error: { type: "string" } },
        },
      },
    },
    paths: {
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "Search and list products with pagination",
          parameters: [
            { in: "query", name: "q", schema: { type: "string" }, description: "Search keyword" },
            { in: "query", name: "page", schema: { type: "integer", default: 1 } },
            { in: "query", name: "limit", schema: { type: "integer", default: 12 } },
            { in: "query", name: "category", schema: { type: "string" }, description: "Filter by category" },
            { in: "query", name: "brand", schema: { type: "string" }, description: "Filter by brand" },
            {
              in: "query",
              name: "availability",
              schema: { type: "string", enum: ["in_stock", "out_of_stock", "low_stock"] },
              description: "Filter by availability",
            },
            { in: "query", name: "min_price", schema: { type: "number" }, description: "Minimum price" },
            { in: "query", name: "max_price", schema: { type: "number" }, description: "Maximum price" },
          ],
          responses: {
            "200": {
              description: "Paginated product list",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PaginatedProducts" },
                },
              },
            },
            "400": {
              description: "Invalid query parameters",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/Error" } },
              },
            },
          },
        },
        post: {
          tags: ["Admin"],
          summary: "Create a new product",
          security: [{ AdminBearer: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          responses: {
            "201": {
              description: "Created product",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/Product" } },
              },
            },
            "400": { description: "Validation error" },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/api/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Get product detail by ID or slug",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
              description: "Product UUID or slug",
            },
          ],
          responses: {
            "200": {
              description: "Product detail",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/Product" } },
              },
            },
            "404": { description: "Product not found" },
          },
        },
        put: {
          tags: ["Admin"],
          summary: "Update a product",
          security: [{ AdminBearer: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Product" } },
            },
          },
          responses: {
            "200": { description: "Updated product" },
            "400": { description: "Validation error" },
            "401": { description: "Unauthorized" },
            "404": { description: "Product not found" },
          },
        },
        delete: {
          tags: ["Admin"],
          summary: "Delete a product",
          security: [{ AdminBearer: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Deleted successfully" },
            "401": { description: "Unauthorized" },
            "404": { description: "Product not found" },
          },
        },
      },
      "/api/filters": {
        get: {
          tags: ["Filters"],
          summary: "Get available filter options (categories and brands)",
          responses: {
            "200": {
              description: "Filter options",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/FiltersResponse" },
                },
              },
            },
          },
        },
      },
    },
  };
}

