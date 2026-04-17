import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

export const RequestChat = ({ requestId, as }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

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

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Sessão expirada"); setSending(false); return; }
    const { error } = await supabase.from("request_messages").insert({
      request_id: requestId,
      user_id: user.id,
      sender: as,
      content: text,
    });
    setSending(false);
    if (error) { toast.error("Não foi possível enviar"); return; }
    setInput("");
  };

  return (
    <div className="flex flex-col h-[420px] border border-border rounded-lg overflow-hidden bg-card">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/40">
        <MessageCircle className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Chat com a equipe</span>
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
            return (
              <div key={m.id} className={cn("flex flex-col gap-0.5", mine ? "items-end" : "items-start")}>
                <div className={cn("max-w-[80%] px-3 py-2 rounded-2xl text-sm", mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm")}>
                  {m.content}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">
                  {m.sender === "admin" ? "Equipe" : "Cliente"} · {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={send} className="border-t border-border p-2 flex gap-2 bg-card">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escreva uma mensagem..." disabled={sending} />
        <Button type="submit" size="icon" disabled={sending || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
