import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { statusLabels } from "@/data/mockData";
import { MessageCircle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { RequestChat } from "@/components/chat/RequestChat";

interface ConvRow {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  created_at: string;
}

const AdminChats = () => {
  const [conversations, setConversations] = useState<ConvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ConvRow | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("return_requests")
        .select("id, order_id, customer_name, customer_email, status, created_at")
        .order("created_at", { ascending: false });
      const list = (data ?? []) as ConvRow[];
      setConversations(list);
      setSelected(list[0] ?? null);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Atendimento</h1>
        <p className="text-sm text-muted-foreground">Converse em tempo real com os clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        <Card>
          <CardContent className="p-0 max-h-[560px] overflow-y-auto">
            {loading ? (
              <div className="p-3 space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma conversa ainda.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {conversations.map((c) => {
                  const st = statusLabels[c.status] ?? { label: c.status, color: "" };
                  const active = selected?.id === c.id;
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => setSelected(c)}
                        className={cn("w-full text-left p-3 hover:bg-muted/40 transition-colors", active && "bg-muted/60")}
                      >
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-primary shrink-0" />
                          <p className="text-sm font-medium truncate flex-1">{c.customer_name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">Pedido {c.order_id}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <Badge variant="secondary" className={`text-[10px] ${st.color}`}>{st.label}</Badge>
                          <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div>
          {selected ? (
            <div className="space-y-3">
              <Card>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{selected.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{selected.customer_email} · #{selected.id.slice(0, 8)}</p>
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
