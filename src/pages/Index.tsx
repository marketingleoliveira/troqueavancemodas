import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RefreshCw, MessageCircle, Clock } from "lucide-react";
import { Logo } from "@/components/Logo";
import customerIcon from "@/assets/customer-icon.png";

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
              Central de <span className="text-primary">Devoluções</span>
              <br className="hidden sm:block" /> Avance Modas
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
              Solicite a devolução do seu pedido feito na{" "}
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

        {/* Action card */}
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-md mx-auto">
            <div className="group relative bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border border-border/50 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-foreground" />
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5 overflow-hidden">
                <img src={customerIcon} alt="Cliente" width={512} height={512} loading="lazy" className="w-12 h-12 object-contain" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sou Cliente</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Solicite a devolução do seu pedido e acompanhe todo o processo em tempo real.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="w-full gap-2 bg-foreground hover:bg-foreground/90 text-background"
              >
                Solicitar Devolução <ArrowRight className="w-4 h-4" />
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

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground space-x-3">
        <span>© 2026 Avance Modas — Central de Devoluções</span>
        <span>·</span>
        <a
          href="https://www.avancemodas.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary"
        >
          avancemodas.com.br
        </a>
        <span>·</span>
        <button
          onClick={() => navigate("/admin")}
          className="hover:text-primary underline-offset-4 hover:underline"
        >
          Acesso equipe
        </button>
      </footer>
    </div>
  );
};

export default Index;
