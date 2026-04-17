import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PortalProductSelect } from "@/components/portal/PortalProductSelect";
import { PortalReason } from "@/components/portal/PortalReason";
import { PortalResolution } from "@/components/portal/PortalResolution";
import { PortalStepper } from "@/components/portal/PortalStepper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { mockOrders, type Product } from "@/data/mockData";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const steps = ["Pedido", "Produtos", "Motivo", "Resolução", "Confirmar"];

const CustomerNewRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [orderData, setOrderData] = useState<typeof mockOrders[0] | null>(null);
  const [orderId, setOrderId] = useState("");
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [reasons, setReasons] = useState<Record<string, { reason: string; notes: string }>>({});
  const [resolution, setResolution] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onlyDigits = (v: string) => v.replace(/\D/g, "");

  const findOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!orderId.trim() || !cpf.trim()) {
      setError("Informe o número do pedido e o CPF.");
      return;
    }
    const order = mockOrders.find((o) => o.id.toLowerCase() === orderId.trim().toLowerCase());
    if (!order) { setError("Pedido não encontrado. Tente AVN-20241201 ou AVN-20241205."); return; }
    if (onlyDigits(order.customerCpf) !== onlyDigits(cpf)) {
      setError("CPF não confere com o pedido informado.");
      return;
    }
    setOrderData(order);
    setStep(1);
  };

  const submit = async () => {
    if (!user || !orderData) return;
    setSubmitting(true);
    try {
      const code = "BR" + Math.random().toString().slice(2, 11) + "BR";
      const type = resolution === "exchange" ? "exchange" : "return";

      const { data: req, error: reqError } = await supabase.from("return_requests").insert({
        user_id: user.id,
        order_id: orderData.id,
        customer_name: orderData.customerName,
        customer_email: user.email ?? orderData.customerEmail,
        customer_cpf: orderData.customerCpf,
        status: "pending",
        type,
        resolution: resolution as "refund" | "voucher" | "exchange",
        tracking_code: code,
      }).select().single();

      if (reqError) throw reqError;

      const items = selectedProducts.map((p) => ({
        request_id: req.id,
        product_id: p.id,
        product_name: p.name,
        product_image: p.image,
        product_sku: p.sku,
        size: p.size ?? null,
        color: p.color ?? null,
        price: p.price,
        reason: reasons[p.id]?.reason || "other",
        notes: reasons[p.id]?.notes || null,
      }));
      const { error: itemsError } = await supabase.from("return_request_items").insert(items);
      if (itemsError) throw itemsError;

      toast.success("Solicitação criada!");
      navigate(`/minha-conta/solicitacao/${req.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar solicitação.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PortalStepper steps={steps} currentStep={step} />
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          {step === 0 && (
            <Card className="glass-card">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Encontre seu pedido</CardTitle>
                <CardDescription>Informe o número do pedido e o CPF do titular para iniciar.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={findOrder} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderId">Número do Pedido</Label>
                    <Input id="orderId" placeholder="Ex: AVN-20241201" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF do titular</Label>
                    <Input id="cpf" placeholder="Ex: 123.456.789-00" value={cpf} onChange={(e) => setCpf(e.target.value)} />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full">Buscar Pedido</Button>
                </form>
              </CardContent>
            </Card>
          )}
          {step === 1 && orderData && (
            <PortalProductSelect products={orderData.products} onSubmit={(items) => { setSelectedProducts(items); setStep(2); }} />
          )}
          {step === 2 && (
            <PortalReason products={selectedProducts} onSubmit={(d) => { setReasons(d); setStep(3); }} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <PortalResolution onSubmit={(r) => { setResolution(r); setStep(4); }} onBack={() => setStep(2)} />
          )}
          {step === 4 && (
            <Card className="glass-card">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Confirmar solicitação</CardTitle>
                <CardDescription>
                  Resolução: <strong>{resolution === "refund" ? "Reembolso" : resolution === "voucher" ? "Vale-Compras" : "Troca"}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground text-sm mb-1">Política de Trocas e Devoluções</p>
                  <p>• Envio em até 7 dias após aprovação.</p>
                  <p>• Item em embalagem original, sem sinais de uso.</p>
                  <p>• Reembolsos em até 10 dias úteis.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox id="accept" checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} />
                  <label htmlFor="accept" className="text-sm cursor-pointer leading-snug">
                    Li e aceito a Política de Trocas e Devoluções.
                  </label>
                </div>
                <Button onClick={submit} disabled={!accepted || submitting} className="w-full">
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : "Enviar Solicitação"}
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CustomerNewRequest;
