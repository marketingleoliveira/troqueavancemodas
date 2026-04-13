import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ShieldCheck } from "lucide-react";

interface PortalAuthProps {
  onSubmit: (orderId: string, identifier: string) => void;
}

export const PortalAuth = ({ onSubmit }: PortalAuthProps) => {
  const [orderId, setOrderId] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!orderId.trim() || !identifier.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    onSubmit(orderId.trim(), identifier.trim());
  };

  return (
    <Card className="glass-card">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Search className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Encontre seu pedido</CardTitle>
        <CardDescription>
          Informe os dados do pedido para iniciar a solicitação de troca ou devolução.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderId">Número do Pedido</Label>
            <Input
              id="orderId"
              placeholder="Ex: AVN-20241201"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identifier">E-mail ou CPF</Label>
            <Input
              id="identifier"
              placeholder="Ex: maria@email.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">
            Buscar Pedido
          </Button>
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Seus dados estão protegidos
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
