import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/mockData";

interface Props {
  resolution: string;
  orderData: { id: string; customerName: string; customerEmail: string; customerCpf?: string } | null;
  selectedProducts: Product[];
  reasons: Record<string, { reason: string; notes: string }>;
  onRestart: () => void;
}

export const PortalConclusion = ({ resolution, orderData, selectedProducts, reasons, onRestart }: Props) => {
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!orderData) return;
    setSubmitting(true);
    try {
      const type = resolution === "exchange" ? "exchange" : "return";

      const { data: request, error: reqError } = await supabase
        .from("return_requests")
        .insert({
          order_id: orderData.id,
          customer_name: orderData.customerName,
          customer_email: orderData.customerEmail,
          customer_cpf: orderData.customerCpf ?? null,
          status: "pending",
          type,
          resolution: resolution as "refund" | "voucher" | "exchange",
        })
        .select()
        .single();

      if (reqError) throw reqError;

      const items = selectedProducts.map((p) => ({
        request_id: request.id,
        product_id: p.id,
        product_name: p.name,
        product_sku: p.sku,
        size: p.size ?? null,
        color: p.color ?? null,
        price: p.price,
        reason: reasons[p.id]?.reason || "other",
        notes: reasons[p.id]?.notes || null,
      }));

      const { error: itemsError } = await supabase.from("return_request_items").insert(items);
      if (itemsError) throw itemsError;

      setSubmitted(true);
      toast.success("Solicitação registrada com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="glass-card text-center">
        <CardContent className="pt-8 pb-6 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <CardTitle className="text-xl">Solicitação enviada!</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sua solicitação foi registrada com sucesso. Nossa equipe entrará em contato via chat no painel <strong>Minhas Solicitações</strong>.
          </p>

          <Button variant="outline" onClick={onRestart} className="mt-4">
            Nova Solicitação
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Confirmar solicitação</CardTitle>
        <CardDescription>
          Resolução escolhida: <strong>{resolution === "refund" ? "Reembolso" : resolution === "voucher" ? "Vale-Compras" : "Troca"}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground text-sm">Política de Devoluções</p>
          <p>• O produto deve ser enviado em até 7 dias após a aprovação da solicitação.</p>
          <p>• O item deve estar em sua embalagem original, sem sinais de uso.</p>
          <p>• Reembolsos serão processados em até 10 dias úteis após o recebimento.</p>
          <p>• Vales-compras são emitidos imediatamente após a aprovação.</p>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="accept"
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
          />
          <label htmlFor="accept" className="text-sm cursor-pointer leading-snug">
            Li e aceito a <span className="font-medium text-primary underline">Política de Devoluções</span>.
          </label>
        </div>

        <Button onClick={handleSubmit} disabled={!accepted || submitting} className="w-full">
          {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>) : "Enviar Solicitação"}
        </Button>
      </CardContent>
    </Card>
  );
};
