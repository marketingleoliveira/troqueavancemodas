import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Product } from "@/data/mockData";
import { ShoppingBag } from "lucide-react";

interface Props {
  products: Product[];
  onSubmit: (selected: Product[]) => void;
}

export const PortalProductSelect = ({ products, onSubmit }: Props) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    const items = products.filter((p) => selected.has(p.id));
    if (items.length > 0) onSubmit(items);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <ShoppingBag className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Selecione os produtos</CardTitle>
        <CardDescription>Marque os itens que deseja trocar ou devolver.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            onClick={() => toggle(p.id)}
            className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
              selected.has(p.id)
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-border hover:border-primary/30"
            }`}
          >
            <Checkbox checked={selected.has(p.id)} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {[p.size && `Tam: ${p.size}`, p.color, p.sku && `SKU: ${p.sku}`].filter(Boolean).join(" • ")}
              </p>
            </div>
            <span className="text-sm font-semibold whitespace-nowrap">
              R$ {p.price.toFixed(2)}
            </span>
          </div>
        ))}
        <Button onClick={handleSubmit} disabled={selected.size === 0} className="w-full mt-4">
          Continuar ({selected.size} {selected.size === 1 ? "item" : "itens"})
        </Button>
      </CardContent>
    </Card>
  );
};
