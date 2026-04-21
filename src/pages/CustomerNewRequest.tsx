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
import { type Product } from "@/data/mockData";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const steps = ["Pedido", "Produtos", "Motivo", "Resolução", "Confirmar"];

const CustomerNewRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [orderData, setOrderData] = useState<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    products: Product[];
  } | null>(null);
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [reasons, setReasons] = useState<Record<string, { reason: string; notes: string; photos: string[] }>>({});
  const [resolution, setResolution] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onlyDigits = (v: string) => v.replace(/\D/g, "");

  const findOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedOrder = orderId.trim();
    const phoneDigits = onlyDigits(phone);
    if (!trimmedOrder || !phoneDigits) {
      setError("Informe o número do pedido e os últimos 4 dígitos do telefone.");
      return;
    }
    if (phoneDigits.length < 4) {
      setError("Digite ao menos os últimos 4 dígitos do telefone.");
      return;
    }
    setSearching(true);
    try {
      const normalized = trimmedOrder.replace(/^#/, "");
      const variants = [`#${normalized}`, normalized];
      console.log("[findOrder] buscando", variants);
      const { data: orders, error: qErr } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, customer_email, customer_phone")
        .in("order_number", variants)
        .limit(1);
      if (qErr) throw qErr;
      const order = orders?.[0];
      console.log("[findOrder] pedido", order);
      if (!order) {
        setError("Pedido não encontrado. Verifique o número informado.");
        return;
      }
      const orderPhoneDigits = onlyDigits(order.customer_phone ?? "");
      const last4 = phoneDigits.slice(-4);
      if (!orderPhoneDigits || !orderPhoneDigits.endsWith(last4)) {
        setError("Os últimos 4 dígitos do telefone não conferem com o pedido.");
        return;
      }

      // Bloqueia novas solicitações se já houver uma para o pedido
      const { data: existing } = await supabase
        .from("return_requests")
        .select("id, status")
        .eq("order_id", order.order_number)
        .limit(1);
      const prev = existing?.[0];
      if (prev) {
        if (prev.status === "rejected") {
          setError("Este pedido teve uma solicitação considerada improcedente e não pode receber novas solicitações.");
        } else {
          setError("Já existe uma solicitação em andamento para este pedido.");
        }
        return;
      }

      // Load items
      const { data: items, error: itErr } = await supabase
        .from("order_items")
        .select("id, product_name, product_sku, variant, quantity, price")
        .eq("order_id", order.id);
      if (itErr) throw itErr;

      const products: Product[] = (items ?? []).map((it) => {
        const [size, color] = (it.variant ?? "").split(" / ");
        return {
          id: it.id,
          name: it.product_name,
          image: "",
          sku: it.product_sku ?? "",
          size: size || undefined,
          color: color || undefined,
          price: Number(it.price) || 0,
        };
      });

      if (products.length === 0) {
        setError("Este pedido não possui itens cadastrados.");
        return;
      }

      setOrderData({
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name ?? "",
        customerEmail: order.customer_email ?? user?.email ?? "",
        customerPhone: order.customer_phone ?? "",
        products,
      });
      setStep(1);
    } catch (err) {
      console.error(err);
      setError("Erro ao buscar pedido. Tente novamente.");
    } finally {
      setSearching(false);
    }
  };

  const submit = async () => {
    if (!user || !orderData) return;
    setSubmitting(true);
    try {
      const type = resolution === "exchange" ? "exchange" : "return";

      const { data: req, error: reqError } = await supabase.from("return_requests").insert({
        user_id: user.id,
        order_id: orderData.orderNumber,
        customer_name: orderData.customerName || (user.email ?? ""),
        customer_email: user.email ?? orderData.customerEmail,
        customer_cpf: null,
        status: "pending",
        type,
        resolution: resolution as "refund" | "voucher" | "exchange",
      }).select().single();

      if (reqError) throw reqError;

      const items = selectedProducts.map((p) => ({
        request_id: req.id,
        product_id: p.id,
        product_name: p.name,
        product_sku: p.sku,
        size: p.size ?? null,
        color: p.color ?? null,
        price: p.price,
        reason: reasons[p.id]?.reason || "other",
        notes: reasons[p.id]?.notes || null,
        photos: reasons[p.id]?.photos ?? [],
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
                <CardDescription>Informe o número do pedido e os últimos 4 dígitos do telefone cadastrado.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={findOrder} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderId">Número do Pedido</Label>
                    <Input id="orderId" placeholder="Ex: #1001" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Últimos 4 dígitos do telefone</Label>
                    <Input id="phone" inputMode="numeric" maxLength={15} placeholder="Ex: 1234" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={searching}>
                    {searching ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Buscando...</> : "Buscar Pedido"}
                  </Button>
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
                  <p className="font-semibold text-foreground text-sm mb-1">Política de Devoluções</p>
                  <p>• Envio em até 7 dias após aprovação.</p>
                  <p>• Item em embalagem original, sem sinais de uso.</p>
                  <p>• Reembolsos em até 10 dias úteis.</p>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm space-y-1">
                  <p className="font-semibold text-foreground">Próximos passos</p>
                  <p className="text-muted-foreground">
                    Após o envio, nossa equipe analisará sua solicitação e entrará em contato via <strong>chat</strong> no painel <strong>Minhas Solicitações</strong>. Se aprovada, você poderá conversar em tempo real com a equipe para tratar a devolução do produto.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox id="accept" checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} />
                  <label htmlFor="accept" className="text-sm cursor-pointer leading-snug">
                    Li e aceito a Política de Devoluções.
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
