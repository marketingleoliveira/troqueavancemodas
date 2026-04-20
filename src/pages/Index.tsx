import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Store, RefreshCw, MessageCircle, Clock } from "lucide-react";
import { Logo } from "@/components/Logo";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <header className="border-b border-border/40 bg-background/70 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Logo className="h-10 w-auto" />
          <a
            href="https://www.avancemodas.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            avancemodas.com.br ↗
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 pt-16 pb-12 text-center">
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <Logo className="h-20 sm:h-24 w-auto mx-auto" />
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Central de <span className="text-primary">Trocas</span>
              <br className="hidden sm:block" /> e Devoluções
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
              Solicite a troca ou devolução do seu pedido feito na{" "}
              <a
                href="https://www.avancemodas.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                Avance Modas
              </a>{" "}
              de forma rápida, simples e 100% online.
            </p>
          </div>
        </section>

        {/* Action cards */}
        <section className="container mx-auto px-4 pb-16">
          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <div className="group relative bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border border-border/50 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-foreground" />
              <div className="w-14 h-14 rounded-2xl bg-foreground text-background flex items-center justify-center mb-5">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sou Cliente</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Solicite a troca ou devolução do seu pedido e acompanhe todo o processo em tempo real.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="w-full gap-2 bg-foreground hover:bg-foreground/90 text-background"
              >
                Solicitar Troca/Devolução <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="group relative bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border border-border/50 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
              <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mb-5">
                <Store className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Equipe Avance</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Acesso restrito para administração das solicitações, atendimento e relatórios.
              </p>
              <Button size="lg" onClick={() => navigate("/admin")} className="w-full gap-2">
                Acessar Painel <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="container mx-auto px-4 pb-20">
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: RefreshCw, title: "Processo 100% online", desc: "Sem precisar ligar ou ir até a loja." },
              { icon: MessageCircle, title: "Chat em tempo real", desc: "Fale direto com nossa equipe." },
              { icon: Clock, title: "Resposta rápida", desc: "Retornamos em até 48h úteis." },
            ].map((b) => (
              <div key={b.title} className="text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <b.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        © 2026 Avance Modas — Central de Trocas e Devoluções ·{" "}
        <a
          href="https://www.avancemodas.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary"
        >
          avancemodas.com.br
        </a>
      </footer>
    </div>
  );
};

export default Index;
