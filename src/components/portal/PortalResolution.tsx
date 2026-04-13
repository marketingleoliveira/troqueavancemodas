import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Banknote, Gift, RefreshCw, Clock, Sparkles } from "lucide-react";

interface Props {
  onSubmit: (resolution: string) => void;
  onBack: () => void;
}

const options = [
  {
    id: "refund",
    icon: Banknote,
    title: "Reembolso",
    description: "Devolução do valor pago ao método de pagamento original.",
    note: "Prazo de até 10 dias úteis",
    noteIcon: Clock,
    recommended: false,
  },
  {
    id: "voucher",
    icon: Gift,
    title: "Vale-Compras",
    description: "Receba um crédito para usar na loja com bônus de 10%.",
    note: "Disponível imediatamente",
    noteIcon: Sparkles,
    recommended: true,
  },
  {
    id: "exchange",
    icon: RefreshCw,
    title: "Troca de Tamanho/Cor",
    description: "Envie o item de volta e receba o correto sem custo.",
    note: "Envio grátis",
    noteIcon: null,
    recommended: false,
  },
];

export const PortalResolution = ({ onSubmit, onBack }: Props) => {
  const [selected, setSelected] = useState<string>("");

  return (
    <Card className="glass-card">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Gift className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Como deseja resolver?</CardTitle>
        <CardDescription>Escolha a melhor opção para você.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map((opt) => (
          <div
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={`relative p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              selected === opt.id
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-border hover:border-primary/30"
            }`}
          >
            {opt.recommended && (
              <Badge className="absolute -top-2.5 right-3 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 gap-1">
                <Sparkles className="w-3 h-3" /> Recomendado
              </Badge>
            )}
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                selected === opt.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                <opt.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{opt.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  {opt.noteIcon && <opt.noteIcon className="w-3 h-3" />}
                  {opt.note}
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <Button onClick={() => onSubmit(selected)} disabled={!selected} className="flex-1">
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
