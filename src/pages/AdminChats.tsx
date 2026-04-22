import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { statusLabels, resolutionLabels } from "@/data/mockData";
import { MessageCircle, Inbox, Search, CheckCircle2, Truck, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { RequestChat } from "@/components/chat/RequestChat";
import { toast } from "sonner";

interface ConvRow {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  resolution: string;
  created_at: string;
}

const AdminChats = () => {
  const [conversations, setConversations] = useState<ConvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchList = async () => {
    const { data } = await supabase
      .from("return_requests")
      .select("id, order_id, customer_name, customer_email, status, resolution, created_at")
      .in("status", ["received", "awaiting_shipment", "completed"])
      .order("created_at", { ascending: false });
    const list = (data ?? []) as ConvRow[];
    setConversations(list);
    setSelectedId((prev) => prev ?? list[0]?.id ?? null);
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
    const channel = supabase
      .channel("admin-chats-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "return_requests" }, () => fetchList())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return conversations;
    return conversations.filter(
      (c) =>
        c.customer_name.toLowerCase().includes(s) ||
        c.customer_email.toLowerCase().includes(s) ||
        c.order_id.toLowerCase().includes(s) ||
        c.id.toLowerCase().includes(s),
    );
  }, [conversations, search]);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  const updateStatus = async (status: string, successMsg: string) => {
    if (!selected) return;
    setUpdating(true);
    const { error } = await supabase.from("return_requests").update({ status }).eq("id", selected.id);
    setUpdating(false);
    if (error) { toast.error("Não foi possível atualizar"); return; }
    toast.success(successMsg);
    fetchList();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Atendimento</h1>
        <p className="text-sm text-muted-foreground">Negocie devoluções com os clientes em tempo real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        <Card>
          <CardContent className="p-0 max-h-[640px] flex flex-col">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar cliente, pedido..."
                  className="pl-8 h-9"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-3 space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma conversa disponível.</p>
                  <p className="text-[11px] mt-1">Apenas solicitações procedentes aparecem aqui.</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {filtered.map((c) => {
                    const st = statusLabels[c.status] ?? { label: c.status, color: "" };
                    const active = selectedId === c.id;
                    return (
                      <li key={c.id}>
                        <button
                          onClick={() => setSelectedId(c.id)}
                          className={cn("w-full text-left p-3 hover:bg-muted/40 transition-colors", active && "bg-muted/60")}
                        >
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-primary shrink-0" />
                            <p className="text-sm font-medium truncate flex-1">{c.customer_name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">Pedido {c.order_id}</p>
                          <div className="flex items-center justify-between mt-1.5 gap-2">
                            <Badge variant="secondary" className={`text-[10px] ${st.color}`}>{st.label}</Badge>
                            <span className="text-[10px] text-muted-foreground shrink-0">{new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <div>
          {selected ? (
            <div className="space-y-3">
              <Card>
                <CardContent className="p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{selected.customer_name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{selected.customer_email}</span>
                      <span>Pedido {selected.order_id}</span>
                      <span className="font-mono">#{selected.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <Badge variant="secondary" className={`text-[10px] ${(statusLabels[selected.status] ?? {}).color ?? ""}`}>
                        {(statusLabels[selected.status] ?? {}).label ?? selected.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {resolutionLabels[selected.resolution] ?? selected.resolution}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selected.status === "received" && (
                      <Button size="sm" variant="outline" className="gap-1.5" disabled={updating} onClick={() => updateStatus("awaiting_shipment", "Marcado como aguardando postagem.")}>
                        <Truck className="w-3.5 h-3.5" /> Aguardando postagem
                      </Button>
                    )}
                    {selected.status !== "completed" && (
                      <Button size="sm" className="gap-1.5" disabled={updating} onClick={() => updateStatus("completed", "Devolução concluída.")}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Concluir devolução
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              <RequestChat requestId={selected.id} as="admin" />
            </div>
          ) : (
            <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">Selecione uma conversa</CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChats;
