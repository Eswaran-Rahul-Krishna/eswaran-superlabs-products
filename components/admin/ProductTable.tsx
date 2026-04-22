"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, Plus, AlertTriangle } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

interface ProductTableProps {
  products: Product[];
  onDelete: (id: string) => Promise<void>;
}

const availabilityVariant = {
  in_stock: "success" as const,
  low_stock: "secondary" as const,
  out_of_stock: "destructive" as const,
};

const availabilityLabel = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

export function ProductTable({ products, onDelete }: ProductTableProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
    setConfirmId(null);
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {products.map((product) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-b border-border transition-colors hover:bg-muted/50"
              >
                <TableCell className="font-medium max-w-[200px] truncate">
                  {product.name}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">
                  {product.sku}
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>₹{product.price.toLocaleString("en-IN")}</TableCell>
                <TableCell>{product.stock_quantity}</TableCell>
                <TableCell>
                  <Badge variant={availabilityVariant[product.availability]}>
                    {availabilityLabel[product.availability]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {confirmId === product.id ? (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                        >
                          {deletingId === product.id ? "Deleting…" : "Confirm"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button size="icon" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setConfirmId(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No products yet.</p>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add First Product
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
