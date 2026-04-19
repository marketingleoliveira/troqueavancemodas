import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { statusLabels, resolutionLabels } from "@/data/mockData";
import { ArrowLeft, Package } from "lucide-react";
import { RequestChat } from "@/components/chat/RequestChat";

interface Detail {
  id: string;
  order_id: string;
  status: string;
  type: string;
  resolution: string;
  tracking_code: string | null;
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

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from("return_requests")
        .select("*, return_request_items(*)")
        .eq("id", id)
        .maybeSingle();
      setData(data as Detail | null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!data) return <Card><CardContent className="py-10 text-center text-muted-foreground">Solicitação não encontrada.</CardContent></Card>;

  const st = statusLabels[data.status] ?? { label: data.status, color: "" };

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
            <Badge variant="outline" className="text-[10px]">{data.type === "exchange" ? "Troca" : "Devolução"}</Badge>
            <Badge variant="outline" className="text-[10px]">{resolutionLabels[data.resolution]}</Badge>
          </div>
          <div className="text-sm">
            <p className="font-medium">Pedido {data.order_id}</p>
            <p className="text-xs text-muted-foreground">Aberta em {new Date(data.created_at).toLocaleDateString("pt-BR")}</p>
          </div>

          {data.tracking_code && (
            <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Código de Postagem</p>
                <p className="font-mono text-sm font-semibold">{data.tracking_code}</p>
              </div>
            </div>
          )}

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

      <RequestChat requestId={data.id} as="customer" />
    </div>
  );
};

export default CustomerRequestDetail;
