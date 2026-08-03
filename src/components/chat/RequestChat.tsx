import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, MessageCircle, Paperclip, Loader2, Zap, Pencil, Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { loadQuickReplies, QuickReply } from "@/lib/quickReplies";

interface Message {
  id: string;
  sender: "customer" | "admin";
  content: string;
  created_at: string;
  edited_at?: string | null;
}

interface Props {
  requestId: string;
  /** "customer" when used inside the customer panel, "admin" inside the admin panel */
  as: "customer" | "admin";
}

const IMAGE_PREFIX = "[image]";

const isImageMessage = (content: string) => content.startsWith(IMAGE_PREFIX);
const getImageUrl = (content: string) => content.slice(IMAGE_PREFIX.length).trim();

export const RequestChat = ({ requestId, as }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carrega respostas rápidas (apenas no painel admin) + sincroniza com edições em /admin/settings
  useEffect(() => {
    if (as !== "admin") return;
    const sync = () => setQuickReplies(loadQuickReplies());
    sync();
    window.addEventListener("quick-replies:changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("quick-replies:changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, [as]);

  const shortcutMap = useMemo(() => {
    const map = new Map<string, QuickReply>();
    quickReplies.forEach((q) => {
      const sc = (q.shortcut || "").toLowerCase();
      if (sc) map.set(sc, q);
    });
    return map;
  }, [quickReplies]);

  const insertQuickReply = (text: string) => {
    setInput((prev) => (prev ? prev + "\n" : "") + text);
    inputRef.current?.focus();
  };

  // Atalhos Alt + tecla — apenas para a equipe
  useEffect(() => {
    if (as !== "admin" || shortcutMap.size === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const key = e.key.toLowerCase();
      const match = shortcutMap.get(key);
      if (!match) return;
      e.preventDefault();
      insertQuickReply(match.text);
      toast.success(`Modelo "${match.label}" inserido (Alt+${key.toUpperCase()})`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [as, shortcutMap]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setMessages([]);

    (async () => {
      const { data } = await supabase
        .from("request_messages")
        .select("id, sender, content, created_at, edited_at")
        .eq("request_id", requestId)
        .order("created_at", { ascending: true });
      if (mounted) {
        setMessages((data ?? []) as Message[]);
        setLoading(false);
      }
    })();

    const channel = supabase
      .channel(`messages:${requestId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "request_messages", filter: `request_id=eq.${requestId}` }, (payload) => {
        const m = payload.new as Message;
        setMessages((prev) => prev.some((x) => x.id === m.id) ? prev : [...prev, m]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "request_messages", filter: `request_id=eq.${requestId}` }, (payload) => {
        const m = payload.new as Message;
        setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, ...m } : x)));
      })
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, [requestId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const insertMessage = async (content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Sessão expirada"); return false; }
    const { error } = await supabase.from("request_messages").insert({
      request_id: requestId,
      user_id: user.id,
      sender: as,
      content,
    });
    if (error) { toast.error("Não foi possível enviar"); return false; }
    return true;
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setSending(true);
    const ok = await insertMessage(text);
    setSending(false);
    if (ok) setInput("");
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`"${file.name}" não é uma imagem.`);
          continue;
        }
        const ext = file.name.split(".").pop() || "jpg";
        const path = `chat/${requestId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("return-photos")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) {
          console.error(upErr);
          toast.error(`Falha ao enviar "${file.name}"`);
          continue;
        }
        const { data: pub } = supabase.storage.from("return-photos").getPublicUrl(path);
        await insertMessage(`${IMAGE_PREFIX} ${pub.publicUrl}`);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startEdit = (m: Message) => {
    setEditingId(m.id);
    setEditingText(m.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = async (id: string) => {
    const text = editingText.trim();
    if (!text) { toast.error("A mensagem não pode ficar vazia"); return; }
    setSavingEdit(true);
    const { error } = await supabase
      .from("request_messages")
      .update({ content: text, edited_at: new Date().toISOString() })
      .eq("id", id);
    setSavingEdit(false);
    if (error) { toast.error("Não foi possível editar a mensagem"); return; }
    setMessages((prev) => prev.map((x) => (x.id === id ? { ...x, content: text, edited_at: new Date().toISOString() } : x)));
    cancelEdit();
    toast.success("Mensagem editada");
  };

  return (
    <div className="flex flex-col h-[480px] border border-border rounded-lg overflow-hidden bg-card">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/40">
        <MessageCircle className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Chat com {as === "admin" ? "o cliente" : "a equipe"}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">Tempo real</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <>
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-10 w-1/2 ml-auto" />
          </>
        ) : messages.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">Nenhuma mensagem ainda. Envie a primeira!</p>
        ) : (
          messages.map((m) => {
            const mine = m.sender === as;
            const isImg = isImageMessage(m.content);
            return (
              <div key={m.id} className={cn("flex flex-col gap-0.5", mine ? "items-end" : "items-start")}>
                {isImg ? (
                  <a
                    href={getImageUrl(m.content)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("max-w-[80%] rounded-2xl overflow-hidden border border-border", mine ? "rounded-br-sm" : "rounded-bl-sm")}
                  >
                    <img
                      src={getImageUrl(m.content)}
                      alt="Anexo"
                      className="block max-h-64 w-auto object-contain bg-muted"
                    />
                  </a>
                ) : editingId === m.id ? (
                  <div className="w-[85%] space-y-1">
                    <Textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={3}
                      autoFocus
                      className="text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(m.id); }
                        if (e.key === "Escape") cancelEdit();
                      }}
                    />
                    <div className="flex justify-end gap-1">
                      <Button type="button" size="sm" variant="ghost" onClick={cancelEdit} disabled={savingEdit}>
                        <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                      </Button>
                      <Button type="button" size="sm" onClick={() => saveEdit(m.id)} disabled={savingEdit}>
                        {savingEdit ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={cn("group flex items-center gap-1", mine ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn("max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words", mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm")}>
                      {m.content}
                    </div>
                    {mine && (
                      <button
                        type="button"
                        onClick={() => startEdit(m)}
                        aria-label="Editar mensagem"
                        title="Editar mensagem"
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-1 rounded text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
                <span className="text-[10px] text-muted-foreground px-1">
                  {m.sender === "admin" ? "Equipe" : "Cliente"} · {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  {m.edited_at ? " · editada" : ""}
                </span>

              </div>
            );
          })
        )}
      </div>

      <form onSubmit={send} className="border-t border-border p-2 flex gap-2 bg-card">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        {as === "admin" && quickReplies.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="icon" variant="outline" title="Respostas rápidas (Alt + tecla)">
                <Zap className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80 max-h-96 overflow-y-auto">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Respostas rápidas</span>
                <span className="text-[10px] font-normal text-muted-foreground">Alt + tecla</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {quickReplies.map((q) => (
                <DropdownMenuItem
                  key={q.id}
                  onClick={() => insertQuickReply(q.text)}
                  className="flex flex-col items-start gap-0.5"
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="text-xs font-medium truncate">{q.label}</span>
                    {q.shortcut && (
                      <kbd className="shrink-0 px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono uppercase">
                        Alt+{q.shortcut}
                      </kbd>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground line-clamp-2">{q.text}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button
          type="button"
          size="icon"
          variant="outline"
          disabled={uploading || sending}
          onClick={() => fileInputRef.current?.click()}
          title="Anexar imagens"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
        </Button>
        <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escreva uma mensagem..." disabled={sending} />
        <Button type="submit" size="icon" disabled={sending || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
