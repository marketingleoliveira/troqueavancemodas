import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Copy, Package } from "lucide-react";
import { toast } from "sonner";

interface Props {
  resolution: string;
  onRestart: () => void;
}

export const PortalConclusion = ({ resolution, onRestart }: Props) => {
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const trackingCode = "BR" + Math.random().toString().slice(2, 11) + "BR";

  if (submitted) {
    return (
      <Card className="glass-card text-center">
        <CardContent className="pt-8 pb-6 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <CardTitle className="text-xl">Solicitação enviada!</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sua solicitação foi registrada com sucesso. Acompanhe o status pelo e-mail cadastrado.
          </p>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Código de Postagem</p>
            <div className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <span className="font-mono font-bold text-lg tracking-wider">{trackingCode}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  navigator.clipboard.writeText(trackingCode);
                  toast.success("Código copiado!");
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Leve este código a qualquer agência dos Correios para postar o produto.
            </p>
          </div>

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
          <p className="font-semibold text-foreground text-sm">Política de Trocas e Devoluções</p>
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
            Li e aceito a <span className="font-medium text-primary underline">Política de Trocas e Devoluções</span>.
          </label>
        </div>

        <Button onClick={() => setSubmitted(true)} disabled={!accepted} className="w-full">
          Enviar Solicitação
        </Button>
      </CardContent>
    </Card>
  );
};
