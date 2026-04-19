import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { returnReasons, type Product } from "@/data/mockData";
import { MessageSquare, Upload, ArrowLeft, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface ReasonEntry {
  reason: string;
  notes: string;
  photos: string[];
}

interface Props {
  products: Product[];
  onSubmit: (data: Record<string, ReasonEntry>) => void;
  onBack: () => void;
}

const MIN_NOTES = 10;
const MIN_PHOTOS = 1;
const MAX_PHOTOS = 5;

export const PortalReason = ({ products, onSubmit, onBack }: Props) => {
  const { user } = useAuth();
  const [reasons, setReasons] = useState<Record<string, ReasonEntry>>(
    Object.fromEntries(products.map((p) => [p.id, { reason: "", notes: "", photos: [] }]))
  );
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const isItemValid = (id: string) => {
    const r = reasons[id];
    return !!r?.reason && (r.notes?.trim().length ?? 0) >= MIN_NOTES && (r.photos?.length ?? 0) >= MIN_PHOTOS;
  };
  const allValid = products.every((p) => isItemValid(p.id));

  const handleFiles = async (productId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!user) {
      toast.error("Faça login para enviar fotos.");
      return;
    }
    const current = reasons[productId]?.photos ?? [];
    const remaining = MAX_PHOTOS - current.length;
    if (remaining <= 0) {
      toast.error(`Máximo de ${MAX_PHOTOS} fotos por item.`);
      return;
    }
    const list = Array.from(files).slice(0, remaining);
    setUploading((u) => ({ ...u, [productId]: true }));
    try {
      const uploaded: string[] = [];
      for (const file of list) {
        if (!file.type.startsWith("image/")) {
          toast.error(`"${file.name}" não é uma imagem válida.`);
          continue;
        }
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("return-photos")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("return-photos").getPublicUrl(path);
        uploaded.push(pub.publicUrl);
      }
      if (uploaded.length > 0) {
        setReasons((prev) => ({
          ...prev,
          [productId]: { ...prev[productId], photos: [...(prev[productId].photos ?? []), ...uploaded] },
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar fotos. Tente novamente.");
    } finally {
      setUploading((u) => ({ ...u, [productId]: false }));
    }
  };

  const removePhoto = (productId: string, url: string) => {
    setReasons((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], photos: prev[productId].photos.filter((p) => p !== url) },
    }));
  };

  const handleSubmit = () => {
    if (allValid) onSubmit(reasons);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <MessageSquare className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Motivo da devolução</CardTitle>
        <CardDescription>Para cada item, informe o motivo, descreva o ocorrido e envie ao menos 1 foto.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {products.map((p) => {
          const entry = reasons[p.id];
          const notesLen = entry?.notes?.trim().length ?? 0;
          const photosCount = entry?.photos?.length ?? 0;
          return (
            <div key={p.id} className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-sm">{p.name}</span>
                {p.size || p.color ? (
                  <span className="text-xs text-muted-foreground">
                    {[p.size && `Tam: ${p.size}`, p.color].filter(Boolean).join(" • ")}
                  </span>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Motivo <span className="text-destructive">*</span></Label>
                <Select
                  value={entry?.reason || ""}
                  onValueChange={(v) =>
                    setReasons((prev) => ({ ...prev, [p.id]: { ...prev[p.id], reason: v } }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {returnReasons.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  Observações <span className="text-destructive">*</span>{" "}
                  <span className="text-xs text-muted-foreground font-normal">(mínimo {MIN_NOTES} caracteres)</span>
                </Label>
                <Textarea
                  placeholder="Descreva com detalhes o que aconteceu..."
                  value={entry?.notes || ""}
                  onChange={(e) =>
                    setReasons((prev) => ({ ...prev, [p.id]: { ...prev[p.id], notes: e.target.value } }))
                  }
                  rows={3}
                />
                <p className={`text-xs ${notesLen >= MIN_NOTES ? "text-muted-foreground" : "text-destructive"}`}>
                  {notesLen}/{MIN_NOTES} caracteres
                </p>
              </div>
              <div className="space-y-2">
                <Label>
                  Fotos <span className="text-destructive">*</span>{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    ({photosCount}/{MAX_PHOTOS} • mín. {MIN_PHOTOS} foto)
                  </span>
                </Label>
                {photosCount > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.photos.map((url) => (
                      <div key={url} className="relative w-20 h-20 rounded-md overflow-hidden border border-border group">
                        <img src={url} alt="Foto enviada" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(p.id, url)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remover foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="inline-flex">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploading[p.id] || photosCount >= MAX_PHOTOS}
                    onChange={(e) => {
                      handleFiles(p.id, e.target.files);
                      e.currentTarget.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 pointer-events-none"
                    disabled={uploading[p.id] || photosCount >= MAX_PHOTOS}
                    asChild={false}
                  >
                    {uploading[p.id] ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Enviar fotos</>
                    )}
                  </Button>
                </label>
                {photosCount < MIN_PHOTOS && (
                  <p className="text-xs text-destructive">Envie ao menos {MIN_PHOTOS} foto.</p>
                )}
              </div>
            </div>
          );
        })}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <Button onClick={handleSubmit} disabled={!allValid} className="flex-1">
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
