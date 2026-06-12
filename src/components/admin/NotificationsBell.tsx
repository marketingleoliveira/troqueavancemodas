import { Bell, Volume2, VolumeX, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

export const NotificationsBell = () => {
  const { unread, items, markAllRead, remove, soundEnabled, setSoundEnabled } = useAdminNotifications();
  const navigate = useNavigate();

  return (
    <Popover onOpenChange={(open) => { if (open) markAllRead(); }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative" aria-label="Notificações">
          <Bell className={`w-4 h-4 ${unread > 0 ? "animate-pulse text-primary" : ""}`} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-sm font-medium">Notificações</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title={soundEnabled ? "Desligar som" : "Ligar som"}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
          </Button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8 px-3">
              Nenhuma mensagem nova. Você é notificado quando uma cliente responder.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((it) => (
                <li key={it.id} className="group flex items-start gap-2 px-3 py-2 hover:bg-muted/40">
                  <MessageCircle className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <button
                    type="button"
                    className="text-left flex-1 min-w-0"
                    onClick={() => { remove(it.id); navigate("/admin/chats"); }}
                  >
                    <p className="text-xs font-medium truncate">{it.customerName}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{it.preview}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(it.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); remove(it.id); }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-border p-2">
            <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/admin/chats")}>
              Abrir atendimento
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
