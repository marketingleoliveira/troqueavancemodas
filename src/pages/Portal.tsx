import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PortalAuth } from "@/components/portal/PortalAuth";
import { PortalProductSelect } from "@/components/portal/PortalProductSelect";
import { PortalReason } from "@/components/portal/PortalReason";
import { PortalResolution } from "@/components/portal/PortalResolution";
import { PortalConclusion } from "@/components/portal/PortalConclusion";
import { PortalStepper } from "@/components/portal/PortalStepper";
import { mockOrders, type Product } from "@/data/mockData";
import { Package } from "lucide-react";

const steps = ["Identificação", "Produtos", "Motivo", "Resolução", "Conclusão"];

const Portal = () => {
  const [step, setStep] = useState(0);
  const [orderData, setOrderData] = useState<typeof mockOrders[0] | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [reasons, setReasons] = useState<Record<string, { reason: string; notes: string }>>({});
  const [resolution, setResolution] = useState<string>("");

  const handleAuth = (orderId: string, _identifier: string) => {
    const order = mockOrders.find((o) => o.id === orderId);
    if (order) {
      setOrderData(order);
      setStep(1);
    }
  };

  const handleProductSelect = (products: Product[]) => {
    setSelectedProducts(products);
    setStep(2);
  };

  const handleReasons = (data: Record<string, { reason: string; notes: string }>) => {
    setReasons(data);
    setStep(3);
  };

  const handleResolution = (res: string) => {
    setResolution(res);
    setStep(4);
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Central de Trocas
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {step < 5 && <PortalStepper steps={steps} currentStep={step} />}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {step === 0 && <PortalAuth onSubmit={handleAuth} />}
            {step === 1 && orderData && (
              <PortalProductSelect products={orderData.products} onSubmit={handleProductSelect} />
            )}
            {step === 2 && (
              <PortalReason products={selectedProducts} onSubmit={handleReasons} onBack={() => setStep(1)} />
            )}
            {step === 3 && (
              <PortalResolution onSubmit={handleResolution} onBack={() => setStep(2)} />
            )}
            {step === 4 && (
              <PortalConclusion
                resolution={resolution}
                orderData={orderData}
                selectedProducts={selectedProducts}
                reasons={reasons}
                onRestart={() => { setStep(0); setOrderData(null); setSelectedProducts([]); setReasons({}); setResolution(""); }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Portal;
