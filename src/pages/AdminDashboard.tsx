import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, Package, TrendingUp, Star, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [retentionRate, setRetentionRate] = useState(0);
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: requests } = await supabase.from("return_requests").select("id, resolution");
      const { data: items } = await supabase.from("return_request_items").select("reason");

      const t = requests?.length ?? 0;
      const refunds = requests?.filter((r) => r.resolution === "refund").length ?? 0;
      setTotal(t);
      setRetentionRate(t > 0 ? Math.round(((t - refunds) / t) * 100) : 0);

      const reasonCounts: Record<string, number> = {};
      items?.forEach((it) => {
        const label = it.reason === "defect" ? "Defeito" : it.reason === "wrong_size" ? "Tamanho" : it.reason === "regret" ? "Arrependimento" : "Outro";
        reasonCounts[label] = (reasonCounts[label] || 0) + 1;
      });
      setChartData(Object.entries(reasonCounts).map(([name, value]) => ({ name, value })));
      setLoading(false);
    })();
  }, []);

  const metrics = [
    { title: "Solicitações no mês", value: total, icon: Package, change: "—" },
    { title: "Retenção (Vale/Troca)", value: `${retentionRate}%`, icon: TrendingUp, change: "—" },
    { title: "NPS Médio", value: "—", icon: Star, change: "—" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral das trocas e devoluções</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <Card key={m.title}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{m.title}</p>
                  {loading ? <Skeleton className="h-9 w-20" /> : <p className="text-3xl font-bold">{m.value}</p>}
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <m.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-3 h-3" /> {m.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Motivos de Devolução
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[260px] w-full" />
          ) : chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Sem dados ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
