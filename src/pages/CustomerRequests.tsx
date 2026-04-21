import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { customerStatusLabels } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { Inbox, MessageCircle, Plus, Package } from "lucide-react";

interface Row {
  id: string;
  order_id: string;
  status: string;
  type: string;
  resolution: string;
  created_at: string;
  return_request_items: { product_name: string }[];
}

const CustomerRequests = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = async () => {
    const { data } = await supabase
      .from("return_requests")
      .select("id, order_id, status, type, resolution, created_at, return_request_items(product_name)")
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
    if (!user) return;
    const channel = supabase
      .channel(`customer-requests:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "return_requests", filter: `user_id=eq.${user.id}` },
        () => fetchRows(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  if (loading) {
    return <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }

  if (rows.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12 text-center space-y-4">
          <Inbox className="w-10 h-10 mx-auto text-muted-foreground opacity-50" />
          <div>
            <p className="font-medium">Você ainda não tem solicitações</p>
            <p className="text-sm text-muted-foreground">Crie uma nova solicitação de devolução.</p>
          </div>
          <Button asChild><Link to="/minha-conta/nova"><Plus className="w-4 h-4 mr-2" />Nova Solicitação</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const st = customerStatusLabels[r.status] ?? { label: r.status, color: "" };
        const chatLiberado = r.status === "received";
        return (
          <Card key={r.id} className="glass-card hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">#{r.id.slice(0, 8)}</span>
                    <Badge variant="secondary" className={`text-[10px] ${st.color}`}>{st.label}</Badge>
                  </div>
                  <p className="text-sm font-medium truncate">Pedido {r.order_id}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")} · {r.return_request_items.length} {r.return_request_items.length === 1 ? "item" : "itens"}
                  </p>
                </div>
                <Button asChild size="sm" variant={chatLiberado ? "default" : "outline"} className="gap-1 shrink-0">
                  <Link to={`/minha-conta/solicitacao/${r.id}`}>
                    <MessageCircle className="w-3.5 h-3.5" />
                    {chatLiberado ? "Negociar" : "Ver"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CustomerRequests;
