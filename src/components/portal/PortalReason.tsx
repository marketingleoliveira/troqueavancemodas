import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { returnReasons, type Product } from "@/data/mockData";
import { MessageSquare, Upload, ArrowLeft } from "lucide-react";

interface Props {
  products: Product[];
  onSubmit: (data: Record<string, { reason: string; notes: string }>) => void;
  onBack: () => void;
}

export const PortalReason = ({ products, onSubmit, onBack }: Props) => {
  const [reasons, setReasons] = useState<Record<string, { reason: string; notes: string }>>(
    Object.fromEntries(products.map((p) => [p.id, { reason: "", notes: "" }]))
  );

  const allFilled = products.every((p) => reasons[p.id]?.reason);

  const handleSubmit = () => {
    if (allFilled) onSubmit(reasons);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <MessageSquare className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Motivo da devolução</CardTitle>
        <CardDescription>Nos conte o que aconteceu com cada item.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {products.map((p) => (
          <div key={p.id} className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <img src={p.image} alt={p.name} className="w-10 h-10 rounded-md object-cover" />
              <span className="font-medium text-sm">{p.name}</span>
            </div>
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Select
                value={reasons[p.id]?.reason || ""}
                onValueChange={(v) =>
                  setReasons((prev) => ({ ...prev, [p.id]: { ...prev[p.id], reason: v } }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um motivo" />
                </SelectTrigger>
                <SelectContent>
                  {returnReasons.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea
                placeholder="Descreva com mais detalhes..."
                value={reasons[p.id]?.notes || ""}
                onChange={(e) =>
                  setReasons((prev) => ({ ...prev, [p.id]: { ...prev[p.id], notes: e.target.value } }))
                }
                rows={2}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="w-4 h-4" /> Enviar fotos
            </Button>
          </div>
        ))}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <Button onClick={handleSubmit} disabled={!allFilled} className="flex-1">
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
