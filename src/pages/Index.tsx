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
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-tight">Avance Modas</span>
              <span className="text-[10px] text-muted-foreground">Central de Trocas e Devoluções</span>
            </div>
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
              Central de <span className="text-primary">Trocas e Devoluções</span> da Avance Modas
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Solicite a troca ou devolução do seu pedido feito em{" "}
              <a href="https://www.avancemodas.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                avancemodas.com.br
              </a>{" "}
              de forma rápida e simples.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
              <ShieldCheck className="w-5 h-5" /> Solicitar Troca/Devolução
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/admin")} className="gap-2">
              <Store className="w-5 h-5" /> Acesso da Equipe Avance
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-muted-foreground">
        © 2026 Avance Modas — Central de Trocas e Devoluções
      </footer>
    </div>
  );
};

export default Index;
