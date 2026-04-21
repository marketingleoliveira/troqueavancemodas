import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { customerStatusLabels, resolutionLabels } from "@/data/mockData";
import { ArrowLeft } from "lucide-react";
import { RequestChat } from "@/components/chat/RequestChat";

interface Detail {
  id: string;
  order_id: string;
  status: string;
  type: string;
  resolution: string;
  notes: string | null;
  created_at: string;
  return_request_items: {
    id: string;
    product_name: string;
    size: string | null;
    color: string | null;
    price: number;
    reason: string;
    notes: string | null;
    photos: string[];
  }[];
}

const reasonLabel = (r: string) => r === "defect" ? "Defeito" : r === "wrong_size" ? "Tamanho errado" : r === "regret" ? "Arrependimento" : "Outro";

const CustomerRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("return_requests")
      .select("*, return_request_items(*)")
      .eq("id", id)
      .maybeSingle();
    setData(data as Detail | null);
    setLoading(false);
  };

  useEffect(() => {
    if (!id) return;
    fetchDetail();
    const channel = supabase
      .channel(`request-detail:${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "return_requests", filter: `id=eq.${id}` },
        () => fetchDetail(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!data) return <Card><CardContent className="py-10 text-center text-muted-foreground">Solicitação não encontrada.</CardContent></Card>;

  const st = customerStatusLabels[data.status] ?? { label: data.status, color: "" };

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="gap-1 -ml-2">
        <Link to="/minha-conta"><ArrowLeft className="w-4 h-4" />Voltar</Link>
      </Button>

      <Card className="glass-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">#{data.id.slice(0, 8)}</span>
            <Badge variant="secondary" className={`text-[10px] ${st.color}`}>{st.label}</Badge>
            <Badge variant="outline" className="text-[10px]">Devolução</Badge>
            <Badge variant="outline" className="text-[10px]">{resolutionLabels[data.resolution]}</Badge>
          </div>
          <div className="text-sm">
            <p className="font-medium">Pedido {data.order_id}</p>
            <p className="text-xs text-muted-foreground">Aberta em {new Date(data.created_at).toLocaleDateString("pt-BR")}</p>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Produtos</p>
            <div className="space-y-2">
              {data.return_request_items.map((p) => (
                <div key={p.id} className="p-3 rounded-lg bg-muted/40 space-y-2">
                  <div className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{p.product_name}</p>
                      <p className="text-xs text-muted-foreground">Motivo: {reasonLabel(p.reason)}</p>
                      {p.notes && <p className="text-xs text-muted-foreground italic">"{p.notes}"</p>}
                    </div>
                    <p className="text-sm font-semibold whitespace-nowrap">R$ {Number(p.price).toFixed(2)}</p>
                  </div>
                  {p.photos && p.photos.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Fotos enviadas</p>
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
        </CardContent>
      </Card>

      {data.status === "rejected" ? (
        <Card className="border-destructive/40">
          <CardContent className="p-4 space-y-1">
            <p className="text-sm font-semibold text-destructive">Solicitação considerada improcedente</p>
            <p className="text-xs text-muted-foreground">
              {data.notes || "A equipe não informou um motivo."}
            </p>
          </CardContent>
        </Card>
      ) : data.status === "pending" ? (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium">Aguardando análise da equipe</p>
            <p className="text-xs text-muted-foreground mt-1">
              O chat será liberado assim que sua solicitação for considerada procedente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <RequestChat requestId={data.id} as="customer" />
      )}
    </div>
  );
};

export default CustomerRequestDetail;
