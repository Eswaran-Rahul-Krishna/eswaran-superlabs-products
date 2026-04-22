"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect } from "react";

interface SearchBarProps {
  defaultValue?: string;
}

export function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const debouncedValue = useDebounce(value, 400);

  const updateSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      params.set("page", "1");
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    updateSearch(debouncedValue);
  }, [debouncedValue, updateSearch]);

  return (
    <div className="relative w-full max-w-2xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        className="pl-10 pr-10 h-12 text-base"
        placeholder="Search products, brands, categories…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          onClick={() => setValue("")}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
