"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2
  );

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {pages.map((p, idx) => {
        const prevPage = pages[idx - 1];
        const showEllipsis = prevPage && p - prevPage > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && (
              <span className="px-2 text-muted-foreground">…</span>
            )}
            <Button
              variant={p === page ? "default" : "outline"}
              size="icon"
              onClick={() => goToPage(p)}
            >
              {p}
            </Button>
          </span>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
