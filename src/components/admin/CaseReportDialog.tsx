import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { statusLabels, resolutionLabels } from "@/data/mockData";

interface Props {
  requestId: string;
  customerName: string;
  customerEmail: string;
  orderId: string;
  status: string;
  resolution: string;
}

const reasonLabel = (r: string) =>
  r === "defect" ? "Defeito" : r === "wrong_size" ? "Tamanho errado" : r === "regret" ? "Arrependimento" : "Outro";

const STORAGE_KEY = (id: string) => `case-report:${id}`;

export const CaseReportDialog = ({ requestId, customerName, customerEmail, orderId, status, resolution }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState(customerName);
  const [phone, setPhone] = useState("");
  const [pixKeyType, setPixKeyType] = useState("cpf");
  const [pixKey, setPixKey] = useState("");
  const [amount, setAmount] = useState("");
  const [actionTaken, setActionTaken] = useState(resolutionLabels[resolution] ?? resolution);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY(requestId));
      if (raw) {
        const d = JSON.parse(raw);
        setFullName(d.fullName ?? customerName);
        setPhone(d.phone ?? "");
        setPixKeyType(d.pixKeyType ?? "cpf");
        setPixKey(d.pixKey ?? "");
        setAmount(d.amount ?? "");
        setActionTaken(d.actionTaken ?? (resolutionLabels[resolution] ?? resolution));
        setSummary(d.summary ?? "");
      }
    } catch {}
  }, [open, requestId, customerName, resolution]);

  const persist = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY(requestId),
        JSON.stringify({ fullName, phone, pixKeyType, pixKey, amount, actionTaken, summary }),
      );
    } catch {}
  };

  const generate = async () => {
    if (!fullName.trim() || !pixKey.trim()) {
      toast.error("Preencha nome completo e chave PIX.");
      return;
    }
    setLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const { data: req } = await supabase
        .from("return_requests")
        .select("*, return_request_items(*)")
        .eq("id", requestId)
        .single();

      const { data: msgs } = await supabase
        .from("request_messages")
        .select("sender, body, created_at")
        .eq("request_id", requestId)
        .order("created_at", { ascending: true });

      persist();

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Atendimento", 14, 18);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Avance Modas — gerado em ${new Date().toLocaleString("pt-BR")}`, 14, 24);
      doc.setTextColor(0);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Solicitação", 14, 34);
      autoTable(doc, {
        startY: 38,
        theme: "striped",
        headStyles: { fillColor: [30, 30, 30] },
        head: [["Campo", "Valor"]],
        body: [
          ["ID", requestId.slice(0, 8)],
          ["Pedido", orderId],
          ["Cliente (cadastro)", customerName],
          ["E-mail", customerEmail],
          ["Status", statusLabels[status]?.label ?? status],
          ["Resolução", resolutionLabels[resolution] ?? resolution],
          ["Aberto em", req?.created_at ? new Date(req.created_at).toLocaleString("pt-BR") : "—"],
        ],
      });

      let y = (doc as any).lastAutoTable.finalY + 8;
      doc.setFont("helvetica", "bold");
      doc.text("Dados para PIX da compradora", 14, y);
      autoTable(doc, {
        startY: y + 4,
        theme: "striped",
        headStyles: { fillColor: [30, 30, 30] },
        head: [["Campo", "Valor"]],
        body: [
          ["Nome completo", fullName],
          ["Telefone", phone || "—"],
          ["Tipo de chave PIX", pixKeyType.toUpperCase()],
          ["Chave PIX", pixKey],
          ["Valor a transferir", amount ? `R$ ${Number(amount.replace(",", ".")).toFixed(2)}` : "—"],
        ],
      });

      y = (doc as any).lastAutoTable.finalY + 8;
      doc.setFont("helvetica", "bold");
      doc.text("Medidas tomadas", 14, y);
      autoTable(doc, {
        startY: y + 4,
        theme: "striped",
        headStyles: { fillColor: [30, 30, 30] },
        head: [["Campo", "Valor"]],
        body: [
          ["Ação", actionTaken || "—"],
          ["Resumo", summary || "—"],
        ],
      });

      y = (doc as any).lastAutoTable.finalY + 8;
      const items = (req as any)?.return_request_items ?? [];
      if (items.length) {
        doc.setFont("helvetica", "bold");
        doc.text("Itens da solicitação", 14, y);
        autoTable(doc, {
          startY: y + 4,
          theme: "grid",
          headStyles: { fillColor: [30, 30, 30] },
          styles: { fontSize: 9 },
          head: [["Produto", "SKU", "Tam.", "Cor", "Motivo", "Valor"]],
          body: items.map((it: any) => [
            it.product_name ?? "—",
            it.product_sku ?? "—",
            it.size ?? "—",
            it.color ?? "—",
            reasonLabel(it.reason),
            it.price != null ? `R$ ${Number(it.price).toFixed(2)}` : "—",
          ]),
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      }

      if (msgs && msgs.length) {
        if (y > 240) { doc.addPage(); y = 18; }
        doc.setFont("helvetica", "bold");
        doc.text("Histórico da conversa", 14, y);
        autoTable(doc, {
          startY: y + 4,
          theme: "grid",
          headStyles: { fillColor: [30, 30, 30] },
          styles: { fontSize: 9, cellWidth: "wrap" },
          columnStyles: { 2: { cellWidth: 110 } },
          head: [["Data", "Autor", "Mensagem"]],
          body: msgs.map((m: any) => [
            new Date(m.created_at).toLocaleString("pt-BR"),
            m.sender === "admin" ? "Atendente" : "Cliente",
            m.body ?? "",
          ]),
        });
      }

      doc.save(`atendimento-${requestId.slice(0, 8)}.pdf`);
      toast.success("Relatório gerado.");
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
        <Button size="sm" variant="outline" className="gap-1.5">
          <FileDown className="w-3.5 h-3.5" /> Relatório do atendimento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Relatório do atendimento</DialogTitle>
          <DialogDescription>
            Preencha os dados informados pela cliente no chat para gerar o PDF com as medidas tomadas e os dados do PIX.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Nome completo da compradora</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone completo (DDD + número)</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-2">
            <div className="space-y-1.5">
              <Label>Tipo de chave</Label>
              <Select value={pixKeyType} onValueChange={setPixKeyType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="telefone">Telefone</SelectItem>
                  <SelectItem value="aleatoria">Aleatória</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input id="pixKey" value={pixKey} onChange={(e) => setPixKey(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">Valor a transferir (R$)</Label>
            <Input id="amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="action">Ação tomada</Label>
            <Input id="action" value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="summary">Resumo do atendimento</Label>
            <Textarea id="summary" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Descreva brevemente o desfecho, combinados com a cliente, prazos, etc." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { persist(); setOpen(false); }} disabled={loading}>Salvar e fechar</Button>
          <Button onClick={generate} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {loading ? "Gerando..." : "Baixar PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
