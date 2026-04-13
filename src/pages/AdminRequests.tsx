import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockReturnRequests, statusLabels, resolutionLabels, type ReturnRequest } from "@/data/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, Gift, Truck, Eye } from "lucide-react";
import { toast } from "sonner";

const AdminRequests = () => {
  const [selected, setSelected] = useState<ReturnRequest | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Solicitações</h1>
        <p className="text-sm text-muted-foreground">Gerencie as trocas e devoluções dos clientes</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">ID</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Data</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Tipo</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockReturnRequests.map((req) => {
                  const st = statusLabels[req.status];
                  return (
                    <tr key={req.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-xs">{req.id}</td>
                      <td className="p-3">{req.customerName}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">
                        {new Date(req.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className={`text-[10px] ${st.color}`}>
                          {st.label}
                        </Badge>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <Badge variant="outline" className="text-[10px]">
                          {req.type === "exchange" ? "Troca" : "Devolução"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm" onClick={() => setSelected(req)} className="gap-1">
                          <Eye className="w-3.5 h-3.5" /> Ver
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>Solicitação {selected.id}</SheetTitle>
                <SheetDescription>Pedido {selected.orderId}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Cliente</p>
                    <p className="font-medium">{selected.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">E-mail</p>
                    <p className="font-medium">{selected.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Data</p>
                    <p className="font-medium">{new Date(selected.date).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Resolução</p>
                    <p className="font-medium">{resolutionLabels[selected.resolution]}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Produtos</p>
                  <div className="space-y-3">
                    {selected.products.map((p) => (
                      <div key={p.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                        <img src={p.image} alt={p.name} className="w-12 h-12 rounded-md object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Motivo: {p.reason === "defect" ? "Defeito" : p.reason === "wrong_size" ? "Tamanho errado" : p.reason === "regret" ? "Arrependimento" : "Outro"}
                          </p>
                          {p.notes && <p className="text-xs text-muted-foreground italic mt-0.5">"{p.notes}"</p>}
                        </div>
                        <p className="text-sm font-semibold">R$ {p.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selected.trackingCode && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Código de Rastreio</p>
                      <p className="font-mono font-medium">{selected.trackingCode}</p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button
                    className="gap-2"
                    onClick={() => { toast.success("Etiqueta gerada com sucesso!"); setSelected(null); }}
                  >
                    <Truck className="w-4 h-4" /> Aprovar e Gerar Etiqueta
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => { toast.success("Vale-compras emitido!"); setSelected(null); }}
                  >
                    <Gift className="w-4 h-4" /> Emitir Vale-Compras
                  </Button>
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={() => { toast.error("Solicitação rejeitada."); setSelected(null); }}
                  >
                    <XCircle className="w-4 h-4" /> Rejeitar Solicitação
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminRequests;
