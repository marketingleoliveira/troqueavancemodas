import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Package, ArrowRight, ShieldCheck, Store } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">TroqueCommerce</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-xl space-y-8 animate-fade-in">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Gestão inteligente de <span className="text-primary">trocas e devoluções</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Plataforma SaaS de logística reversa para e-commerces. Retenha mais clientes, reduza custos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate("/portal")} className="gap-2">
              <ShieldCheck className="w-5 h-5" /> Portal do Cliente
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/admin")} className="gap-2">
              <Store className="w-5 h-5" /> Painel do Lojista
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-muted-foreground">
        © 2026 TroqueCommerce — Todos os direitos reservados
      </footer>
    </div>
  );
};

export default Index;
