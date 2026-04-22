import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { statusLabels, resolutionLabels } from "@/data/mockData";
// jsPDF is dynamically imported inside generate() to keep it out of the initial bundle

const reasonLabel = (r: string) =>
  r === "defect" ? "Defeito" : r === "wrong_size" ? "Tamanho errado" : r === "regret" ? "Arrependimento" : "Outro";

export const MonthlyReportButton = () => {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(defaultMonth);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const [year, m] = month.split("-").map(Number);
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 1);

      const { data: requests, error } = await supabase
        .from("return_requests")
        .select("*, return_request_items(*)")
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      const list = requests ?? [];
      const total = list.length;
      const byStatus: Record<string, number> = {};
      const byResolution: Record<string, number> = {};
      const byReason: Record<string, number> = {};
      let totalValue = 0;

      list.forEach((r: any) => {
        byStatus[r.status] = (byStatus[r.status] || 0) + 1;
        byResolution[r.resolution] = (byResolution[r.resolution] || 0) + 1;
        (r.return_request_items || []).forEach((it: any) => {
          byReason[it.reason] = (byReason[it.reason] || 0) + 1;
          totalValue += Number(it.price || 0);
        });
      });

      const doc = new jsPDF();
      const monthName = start.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

      // Cabeçalho
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Devoluções", 14, 18);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Avance Modas — ${monthName}`, 14, 25);
      doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 14, 30);
      doc.setTextColor(0);

      // Resumo
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo", 14, 42);
      autoTable(doc, {
        startY: 46,
        head: [["Indicador", "Valor"]],
        body: [
          ["Total de solicitações", String(total)],
          ["Valor total dos produtos", `R$ ${totalValue.toFixed(2)}`],
          ["Procedentes (chat liberado)", String(byStatus["received"] || 0)],
          ["Concluídas", String(byStatus["completed"] || 0)],
          ["Improcedentes", String(byStatus["rejected"] || 0)],
          ["Em análise", String(byStatus["pending"] || 0)],
        ],
        theme: "striped",
        headStyles: { fillColor: [30, 30, 30] },
      });

      const afterSummary = (doc as any).lastAutoTable.finalY + 8;

      // Por resolução
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Por tipo de resolução", 14, afterSummary);
      autoTable(doc, {
        startY: afterSummary + 4,
        head: [["Resolução", "Qtd."]],
        body: Object.entries(byResolution).map(([k, v]) => [resolutionLabels[k] ?? k, String(v)]),
        theme: "striped",
        headStyles: { fillColor: [30, 30, 30] },
      });

      const afterRes = (doc as any).lastAutoTable.finalY + 8;

      // Por motivo
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Por motivo de devolução", 14, afterRes);
      autoTable(doc, {
        startY: afterRes + 4,
        head: [["Motivo", "Qtd."]],
        body: Object.entries(byReason).map(([k, v]) => [reasonLabel(k), String(v)]),
        theme: "striped",
        headStyles: { fillColor: [30, 30, 30] },
      });

      // Detalhamento
      doc.addPage();
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Detalhamento das solicitações", 14, 18);
      autoTable(doc, {
        startY: 24,
        head: [["ID", "Data", "Cliente", "Pedido", "Status", "Resolução"]],
        body: list.map((r: any) => [
          r.id.slice(0, 8),
          new Date(r.created_at).toLocaleDateString("pt-BR"),
          r.customer_name,
          r.order_id,
          statusLabels[r.status]?.label ?? r.status,
          resolutionLabels[r.resolution] ?? r.resolution,
        ]),
        theme: "grid",
        headStyles: { fillColor: [30, 30, 30] },
        styles: { fontSize: 9 },
      });

      doc.save(`relatorio-devolucoes-${month}.pdf`);
      toast.success("Relatório gerado com sucesso.");
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar o relatório.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileDown className="w-4 h-4" /> Relatório PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Relatório mensal de devoluções</DialogTitle>
          <DialogDescription>Selecione o mês para gerar e baixar o PDF com as estatísticas.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="month">Mês</Label>
          <Input id="month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={generate} disabled={loading || !month} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {loading ? "Gerando..." : "Baixar PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
