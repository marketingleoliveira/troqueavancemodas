import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockReturnRequests, statusLabels, resolutionLabels } from "@/data/mockData";
import { ArrowUpRight, Package, TrendingUp, Star, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AdminDashboard = () => {
  const total = mockReturnRequests.length;
  const vouchers = mockReturnRequests.filter((r) => r.resolution === "voucher").length;
  const refunds = mockReturnRequests.filter((r) => r.resolution === "refund").length;
  const retentionRate = total > 0 ? Math.round(((total - refunds) / total) * 100) : 0;

  const reasonCounts: Record<string, number> = {};
  mockReturnRequests.forEach((r) => {
    r.products.forEach((p) => {
      const label = p.reason === "defect" ? "Defeito" : p.reason === "wrong_size" ? "Tamanho" : p.reason === "regret" ? "Arrependimento" : "Outro";
      reasonCounts[label] = (reasonCounts[label] || 0) + 1;
    });
  });
  const chartData = Object.entries(reasonCounts).map(([name, value]) => ({ name, value }));

  const metrics = [
    { title: "Solicitações no mês", value: total, icon: Package, change: "+12%" },
    { title: "Retenção (Vale-Compras)", value: `${retentionRate}%`, icon: TrendingUp, change: "+5%" },
    { title: "NPS Médio", value: "8.4", icon: Star, change: "+0.3" },
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
                  <p className="text-3xl font-bold">{m.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <m.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-success flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-3 h-3" /> {m.change} vs. mês anterior
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
