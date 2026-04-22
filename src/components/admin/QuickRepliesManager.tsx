import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, RotateCcw, Save, Keyboard } from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_QUICK_REPLIES,
  loadQuickReplies,
  normalizeShortcut,
  QuickReply,
  saveQuickReplies,
} from "@/lib/quickReplies";

const newId = () => `qr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const QuickRepliesManager = () => {
  const [items, setItems] = useState<QuickReply[]>([]);

  useEffect(() => {
    setItems(loadQuickReplies());
  }, []);

  const update = (id: string, patch: Partial<QuickReply>) => {
    setItems((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const remove = (id: string) => setItems((prev) => prev.filter((q) => q.id !== id));

  const add = () => {
    setItems((prev) => [
      ...prev,
      { id: newId(), label: "Nova resposta", text: "", shortcut: "" },
    ]);
  };

  const reset = () => {
    setItems(DEFAULT_QUICK_REPLIES);
    toast.info("Modelos restaurados ao padrão. Lembre-se de salvar.");
  };

  const persist = () => {
    // valida atalhos duplicados
    const seen = new Map<string, string>();
    for (const q of items) {
      const sc = normalizeShortcut(q.shortcut || "");
      if (!sc) continue;
      if (seen.has(sc)) {
        toast.error(`Atalho "Alt+${sc.toUpperCase()}" duplicado em "${seen.get(sc)}" e "${q.label}".`);
        return;
      }
      seen.set(sc, q.label);
    }
    const cleaned = items
      .map((q) => ({ ...q, shortcut: normalizeShortcut(q.shortcut || "") }))
      .filter((q) => q.text.trim().length > 0);
    saveQuickReplies(cleaned);
    setItems(cleaned);
    toast.success("Respostas rápidas salvas.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Keyboard className="w-4 h-4" /> Respostas rápidas do chat
        </CardTitle>
        <CardDescription>
          Personalize os modelos de mensagem da equipe e defina um atalho de teclado{" "}
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">Alt</kbd> +{" "}
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">tecla</kbd>{" "}
          para inserir cada um direto no campo de mensagem.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum modelo cadastrado. Adicione o primeiro abaixo.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((q, idx) => (
              <div key={q.id} className="rounded-lg border border-border p-3 space-y-2 bg-muted/20">
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex-1 min-w-[180px] space-y-1">
                    <Label htmlFor={`label-${q.id}`} className="text-xs">Título</Label>
                    <Input
                      id={`label-${q.id}`}
                      value={q.label}
                      onChange={(e) => update(q.id, { label: e.target.value })}
                      placeholder={`Modelo ${idx + 1}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`sc-${q.id}`} className="text-xs">Atalho (Alt + tecla)</Label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Alt +</span>
                      <Input
                        id={`sc-${q.id}`}
                        value={q.shortcut}
                        onChange={(e) => update(q.id, { shortcut: normalizeShortcut(e.target.value) })}
                        maxLength={1}
                        placeholder="—"
                        className="w-14 text-center font-mono uppercase"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => remove(q.id)}
                    title="Remover modelo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`text-${q.id}`} className="text-xs">Mensagem</Label>
                  <Textarea
                    id={`text-${q.id}`}
                    value={q.text}
                    onChange={(e) => update(q.id, { text: e.target.value })}
                    rows={2}
                    placeholder="Texto que será inserido no chat ao usar este modelo."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="button" variant="outline" onClick={add} className="gap-1.5">
            <Plus className="w-4 h-4" /> Novo modelo
          </Button>
          <Button type="button" variant="ghost" onClick={reset} className="gap-1.5">
            <RotateCcw className="w-4 h-4" /> Restaurar padrão
          </Button>
          <Button type="button" onClick={persist} className="gap-1.5 ml-auto">
            <Save className="w-4 h-4" /> Salvar respostas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
