"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function DocsPage() {
  useEffect(() => {
    // swagger-ui-react's ModelCollapse uses UNSAFE_componentWillReceiveProps (a React 16-era
    // class component) — it still works correctly; suppress the noise in dev.
    const original = console.error.bind(console);
    console.error = (...args: unknown[]) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("UNSAFE_componentWillReceiveProps")
      ) {
        return;
      }
      original(...args);
    };
    return () => {
      console.error = original;
    };
  }, []);

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
