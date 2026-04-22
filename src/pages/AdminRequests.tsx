import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { statusLabels, resolutionLabels } from "@/data/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CheckCircle2, XCircle, Eye, Inbox, Upload, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { OrdersImportDialog } from "@/components/admin/OrdersImportDialog";

interface RequestItem {
  id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  size: string | null;
  color: string | null;
  price: number;
  reason: string;
  notes: string | null;
  photos: string[];
}

interface ReturnRequestRow {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  type: string;
  resolution: string;
  notes: string | null;
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
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ReturnRequestRow | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    fetchOrdersCount();
    const channel = supabase
      .channel("admin-requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "return_requests" },
        () => fetchRequests(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const markProcedente = async (id: string) => {
    setSubmitting(true);
    const { error } = await supabase
      .from("return_requests")
      .update({ status: "received" })
      .eq("id", id);
    setSubmitting(false);
    if (error) { toast.error("Erro ao atualizar"); return; }
    toast.success("Solicitação procedente. Chat liberado para o cliente.");
    setSelected(null);
    fetchRequests();
  };

  const markImprocedente = async () => {
    if (!selected) return;
    if (!rejectReason.trim()) { toast.error("Informe o motivo da improcedência."); return; }
    setSubmitting(true);
    const { error } = await supabase
      .from("return_requests")
      .update({ status: "rejected", notes: rejectReason.trim() })
      .eq("id", selected.id);
    setSubmitting(false);
    if (error) { toast.error("Erro ao registrar"); return; }
    toast.success("Solicitação registrada como improcedente.");
    setRejectOpen(false);
    setRejectReason("");
    setSelected(null);
    fetchRequests();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    // remove dependentes primeiro (caso não haja cascade)
    await supabase.from("request_messages").delete().eq("request_id", deleteTarget.id);
    await supabase.from("return_request_items").delete().eq("request_id", deleteTarget.id);
    const { error } = await supabase.from("return_requests").delete().eq("id", deleteTarget.id);
    setDeleting(false);
    if (error) { toast.error("Não foi possível excluir"); console.error(error); return; }
    toast.success("Solicitação excluída.");
    setDeleteTarget(null);
    setSelected(null);
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Solicitações</h1>
          <p className="text-sm text-muted-foreground">Gerencie as devoluções dos clientes</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground border border-border rounded-md px-3 py-2">
            <Package className="w-3.5 h-3.5" />
            <span>{ordersCount} pedidos cadastrados</span>
          </div>
          <Button onClick={() => setImportOpen(true)} className="gap-2">
            <Upload className="w-4 h-4" /> Importar Pedidos (CSV)
          </Button>
        </div>
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
                            Devolução
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setSelected(req)} className="gap-1">
                              <Eye className="w-3.5 h-3.5" /> Ver
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget(req); }}
                              className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Excluir solicitação"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
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
                      <div key={p.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{p.product_name}</p>
                            <p className="text-xs text-muted-foreground">Motivo: {reasonLabel(p.reason)}</p>
                            {p.notes && <p className="text-xs text-muted-foreground italic mt-0.5">"{p.notes}"</p>}
                          </div>
                          <p className="text-sm font-semibold whitespace-nowrap">R$ {Number(p.price).toFixed(2)}</p>
                        </div>
                        {p.photos && p.photos.length > 0 && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Fotos enviadas pelo cliente</p>
                            <div className="flex flex-wrap gap-2">
                              {p.photos.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                  <img src={url} alt={`Foto ${i + 1}`} className="w-16 h-16 rounded-md object-cover border border-border" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button
                    className="gap-2"
                    disabled={submitting || selected.status === "received" || selected.status === "rejected"}
                    onClick={() => markProcedente(selected.id)}
                  >
                    <CheckCircle2 className="w-4 h-4" /> PROCEDENTE
                  </Button>
                  <Button
                    variant="destructive"
                    className="gap-2"
                    disabled={submitting || selected.status === "rejected"}
                    onClick={() => { setRejectReason(selected.notes ?? ""); setRejectOpen(true); }}
                  >
                    <XCircle className="w-4 h-4" /> IMPROCEDENTE
                  </Button>
                  {selected.status === "received" && (
                    <p className="text-xs text-muted-foreground text-center">Chat liberado para o cliente negociar a devolução.</p>
                  )}
                  {selected.status === "rejected" && selected.notes && (
                    <div className="text-xs p-2 rounded-md bg-destructive/10 text-destructive">
                      <span className="font-medium">Motivo improcedência:</span> {selected.notes}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <OrdersImportDialog open={importOpen} onOpenChange={setImportOpen} onImported={fetchOrdersCount} />

      <Dialog open={rejectOpen} onOpenChange={(o) => { if (!submitting) setRejectOpen(o); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como improcedente</DialogTitle>
            <DialogDescription>Informe o motivo. Ele ficará registrado e visível ao cliente.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Ex: Produto fora do prazo de devolução, sinais de uso, etc."
            rows={5}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={submitting}>Cancelar</Button>
            <Button variant="destructive" onClick={markImprocedente} disabled={submitting || !rejectReason.trim()}>
              Confirmar improcedência
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequests;
