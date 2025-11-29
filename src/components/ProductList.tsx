"use client"

import type { Product } from "@/src/types/messaging.d"
import { Check, Plus } from "lucide-react"

interface ProductListProps {
  products: Product[]
  selectedIds: Set<number>
  onToggle: (id: number) => void
}

export function ProductList({ products, selectedIds, onToggle }: ProductListProps) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <h2 className="text-lg font-semibold text-foreground mb-5">Productos a Enviar</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {products.map((product) => {
          const isSelected = selectedIds.has(product.id)
          return (
            <button
              key={product.id}
              onClick={() => onToggle(product.id)}
              className="flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left"
              style={{
                borderColor: isSelected ? product.color : "var(--border)",
                backgroundColor: isSelected ? `${product.color}10` : "var(--secondary)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-background"
                  style={{ backgroundColor: product.color }}
                >
                  {product.initials}
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">{product.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {product.code} - {product.weight}
                  </div>
                </div>
              </div>
              <div style={{ color: isSelected ? product.color : "var(--muted-foreground)" }}>
                {isSelected ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
