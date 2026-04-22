import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, MessageCircle, Paperclip, Loader2, Zap } from "lucide-react";
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

interface Message {
  id: string;
  sender: "customer" | "admin";
  content: string;
  created_at: string;
}

interface Props {
  requestId: string;
  /** "customer" when used inside the customer panel, "admin" inside the admin panel */
  as: "customer" | "admin";
}

const IMAGE_PREFIX = "[image]";

const isImageMessage = (content: string) => content.startsWith(IMAGE_PREFIX);
const getImageUrl = (content: string) => content.slice(IMAGE_PREFIX.length).trim();

const ADMIN_QUICK_REPLIES = [
  { label: "👋 Saudação", text: "Olá! Sou da equipe Avance Modas. Estou à disposição para ajudar com sua devolução." },
  { label: "📦 Solicitar postagem", text: "Para darmos sequência, por favor poste o produto nos Correios e nos envie o código de rastreio aqui no chat." },
  { label: "🔍 Recebido — em análise", text: "Recebemos seu produto no nosso CD e ele já está em análise pela equipe de qualidade. Em breve retornamos." },
  { label: "✅ Aprovado — vale-compras", text: "Sua devolução foi aprovada! Em até 2 dias úteis enviaremos um vale-compras no valor integral por e-mail." },
  { label: "💳 Aprovado — reembolso", text: "Sua devolução foi aprovada! O estorno será feito no mesmo cartão/Pix em até 7 dias úteis." },
  { label: "🔁 Aprovado — troca", text: "Sua troca foi aprovada! Já estamos separando o novo produto e enviaremos o código de rastreio em breve." },
  { label: "❓ Pedir mais fotos", text: "Para avançarmos, poderia nos enviar fotos adicionais do produto, mostrando a etiqueta e o ponto do problema?" },
  { label: "🙏 Encerramento", text: "Caso surja qualquer dúvida, estamos aqui. Obrigado pela paciência e pela confiança na Avance Modas!" },
];

export const RequestChat = ({ requestId, as }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setMessages([]);

    (async () => {
      const { data } = await supabase
        .from("request_messages")
        .select("id, sender, content, created_at")
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
                ) : (
                  <div className={cn("max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words", mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm")}>
                    {m.content}
                  </div>
                )}
                <span className="text-[10px] text-muted-foreground px-1">
                  {m.sender === "admin" ? "Equipe" : "Cliente"} · {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
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
        {as === "admin" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="icon" variant="outline" title="Respostas rápidas">
                <Zap className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 max-h-80 overflow-y-auto">
              <DropdownMenuLabel>Respostas rápidas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ADMIN_QUICK_REPLIES.map((q) => (
                <DropdownMenuItem
                  key={q.label}
                  onClick={() => setInput((prev) => (prev ? prev + "\n" : "") + q.text)}
                  className="flex flex-col items-start gap-0.5"
                >
                  <span className="text-xs font-medium">{q.label}</span>
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
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escreva uma mensagem..." disabled={sending} />
        <Button type="submit" size="icon" disabled={sending || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
