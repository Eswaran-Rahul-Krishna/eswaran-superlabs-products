"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, LayoutDashboard, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Products", icon: ShoppingBag },
    { href: "/admin", label: "Admin", icon: LayoutDashboard },
    { href: "/docs", label: "API Docs", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <span className="font-bold text-base tracking-tight">
            SuperLabs<span className="text-muted-foreground font-normal"> Products</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === href || (href !== "/" && pathname.startsWith(href))
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
