import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { statusLabels, resolutionLabels } from "@/data/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { XCircle, Gift, Truck, Eye, Inbox, Upload, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { OrdersImportDialog } from "@/components/admin/OrdersImportDialog";

interface RequestItem {
  id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  product_sku: string | null;
  size: string | null;
  color: string | null;
  price: number;
  reason: string;
  notes: string | null;
}

interface ReturnRequestRow {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  type: string;
  resolution: string;
  tracking_code: string | null;
  created_at: string;
  return_request_items: RequestItem[];
}

const reasonLabel = (r: string) =>
  r === "defect" ? "Defeito" : r === "wrong_size" ? "Tamanho errado" : r === "regret" ? "Arrependimento" : "Outro";

const AdminRequests = () => {
  const [requests, setRequests] = useState<ReturnRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReturnRequestRow | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [ordersCount, setOrdersCount] = useState<number>(0);

  const fetchOrdersCount = async () => {
    const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
    setOrdersCount(count ?? 0);
  };

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("return_requests")
      .select("*, return_request_items(*)")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar solicitações");
      console.error(error);
    } else {
      setRequests((data ?? []) as ReturnRequestRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, status: "completed" | "rejected" | "awaiting_shipment") => {
    const { error } = await supabase.from("return_requests").update({ status }).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar");
      return;
    }
    setSelected(null);
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Solicitações</h1>
        <p className="text-sm text-muted-foreground">Gerencie as trocas e devoluções dos clientes</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Inbox className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhuma solicitação registrada ainda.</p>
            </div>
          ) : (
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
                  {requests.map((req) => {
                    const st = statusLabels[req.status] ?? { label: req.status, color: "" };
                    return (
                      <tr key={req.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-xs">{req.id.slice(0, 8)}</td>
                        <td className="p-3">{req.customer_name}</td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">
                          {new Date(req.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary" className={`text-[10px] ${st.color}`}>{st.label}</Badge>
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
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>Solicitação {selected.id.slice(0, 8)}</SheetTitle>
                <SheetDescription>Pedido {selected.order_id}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Cliente</p>
                    <p className="font-medium">{selected.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">E-mail</p>
                    <p className="font-medium break-all">{selected.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Data</p>
                    <p className="font-medium">{new Date(selected.created_at).toLocaleDateString("pt-BR")}</p>
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
                    {selected.return_request_items.map((p) => (
                      <div key={p.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                        {p.product_image && <img src={p.product_image} alt={p.product_name} className="w-12 h-12 rounded-md object-cover" />}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{p.product_name}</p>
                          <p className="text-xs text-muted-foreground">Motivo: {reasonLabel(p.reason)}</p>
                          {p.notes && <p className="text-xs text-muted-foreground italic mt-0.5">"{p.notes}"</p>}
                        </div>
                        <p className="text-sm font-semibold">R$ {Number(p.price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selected.tracking_code && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Código de Rastreio</p>
                      <p className="font-mono font-medium">{selected.tracking_code}</p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button className="gap-2" onClick={() => { toast.success("Etiqueta gerada!"); updateStatus(selected.id, "awaiting_shipment"); }}>
                    <Truck className="w-4 h-4" /> Aprovar e Gerar Etiqueta
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => { toast.success("Vale-compras emitido!"); updateStatus(selected.id, "completed"); }}>
                    <Gift className="w-4 h-4" /> Concluir / Emitir Vale
                  </Button>
                  <Button variant="destructive" className="gap-2" onClick={() => { toast.error("Solicitação rejeitada."); updateStatus(selected.id, "rejected"); }}>
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
