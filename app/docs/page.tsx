"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Interactive REST API documentation powered by Swagger UI
        </p>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <SwaggerUI url="/api/docs" />
      </div>
    </div>
  );
}
