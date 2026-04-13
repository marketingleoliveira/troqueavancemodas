import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Upload, Palette, Save } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const [returnDays, setReturnDays] = useState("30");
  const [exchangeDays, setExchangeDays] = useState("30");
  const [primaryColor, setPrimaryColor] = useState("#dc2626");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Configure as políticas e personalização da Central do Cliente</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Políticas de Troca e Devolução</CardTitle>
          <CardDescription>Defina os prazos para seus clientes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="returnDays">Prazo de devolução (dias)</Label>
              <Input id="returnDays" type="number" value={returnDays} onChange={(e) => setReturnDays(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exchangeDays">Prazo de troca (dias)</Label>
              <Input id="exchangeDays" type="number" value={exchangeDays} onChange={(e) => setExchangeDays(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personalização da Central</CardTitle>
          <CardDescription>Personalize a experiência do seu cliente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Logo da Loja</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Clique ou arraste para enviar</p>
              <p className="text-xs text-muted-foreground">PNG, JPG ou SVG (máx. 2MB)</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" /> Cor Primária
            </Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-md border border-border cursor-pointer"
              />
              <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="max-w-[140px] font-mono" />
              <div className="w-10 h-10 rounded-md" style={{ backgroundColor: primaryColor }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        className="gap-2"
        onClick={() => toast.success("Configurações salvas!")}
      >
        <Save className="w-4 h-4" /> Salvar Configurações
      </Button>
    </div>
  );
};

export default AdminSettings;
