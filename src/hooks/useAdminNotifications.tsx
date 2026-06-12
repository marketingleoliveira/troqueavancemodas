import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NotifItem {
  id: string;
  requestId: string;
  customerName: string;
  preview: string;
  createdAt: string;
}

interface Ctx {
  unread: number;
  items: NotifItem[];
  markAllRead: () => void;
  remove: (id: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
}

const NotifContext = createContext<Ctx | null>(null);

const SOUND_KEY = "admin-notif-sound";
const MAX_ITEMS = 20;

const playBeep = () => {
  try {
    const AC = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AC) return;
    const ctx = new AC();
    const beep = (freq: number, start: number, dur: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + start);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
      o.start(ctx.currentTime + start);
      o.stop(ctx.currentTime + start + dur + 0.02);
    };
    beep(880, 0, 0.15);
    beep(1175, 0.16, 0.2);
    setTimeout(() => ctx.close().catch(() => {}), 800);
  } catch {}
};

export const AdminNotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<NotifItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try { return localStorage.getItem(SOUND_KEY) !== "0"; } catch { return true; }
  });
  const location = useLocation();
  const originalTitleRef = useRef<string>(typeof document !== "undefined" ? document.title : "");
  const flashIntervalRef = useRef<number | null>(null);

  const setSoundEnabled = (v: boolean) => {
    setSoundEnabledState(v);
    try { localStorage.setItem(SOUND_KEY, v ? "1" : "0"); } catch {}
  };

  const stopFlash = useCallback(() => {
    if (flashIntervalRef.current) {
      window.clearInterval(flashIntervalRef.current);
      flashIntervalRef.current = null;
    }
    document.title = originalTitleRef.current || "Avance Modas";
  }, []);

  const startFlash = useCallback((count: number) => {
    if (typeof document === "undefined") return;
    if (!originalTitleRef.current || !originalTitleRef.current.startsWith("(")) {
      originalTitleRef.current = document.title.replace(/^\(\d+\)\s*/, "");
    }
    const base = originalTitleRef.current || "Avance Modas";
    const alert = `🔔 (${count}) Nova mensagem — ${base}`;
    let toggle = false;
    if (flashIntervalRef.current) window.clearInterval(flashIntervalRef.current);
    document.title = alert;
    flashIntervalRef.current = window.setInterval(() => {
      toggle = !toggle;
      document.title = toggle ? base : alert;
    }, 1200);
  }, []);

  const markAllRead = useCallback(() => {
    setUnread(0);
    stopFlash();
  }, [stopFlash]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Pause notifications when admin is already on the chats page AND tab is focused
  const shouldNotify = useCallback(() => {
    const onChats = location.pathname.startsWith("/admin/chats");
    const focused = typeof document !== "undefined" && document.visibilityState === "visible";
    return !(onChats && focused);
  }, [location.pathname]);

  useEffect(() => {
    let active = true;

    const lookupRequest = async (requestId: string) => {
      const { data } = await supabase
        .from("return_requests")
        .select("customer_name")
        .eq("id", requestId)
        .maybeSingle();
      return data?.customer_name ?? "Cliente";
    };

    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "request_messages" },
        async (payload) => {
          const m: any = payload.new;
          if (m.sender !== "customer") return;
          if (!active) return;

          const customerName = await lookupRequest(m.request_id);
          const preview = String(m.content ?? "").startsWith("[image]")
            ? "📷 Enviou uma imagem"
            : String(m.content ?? "").slice(0, 80);

          const item: NotifItem = {
            id: m.id,
            requestId: m.request_id,
            customerName,
            preview,
            createdAt: m.created_at,
          };

          setItems((prev) => [item, ...prev.filter((i) => i.id !== item.id)].slice(0, MAX_ITEMS));

          if (!shouldNotify()) return;

          setUnread((u) => {
            const next = u + 1;
            startFlash(next);
            return next;
          });

          if (soundEnabled) playBeep();

          toast(`💬 ${customerName}`, {
            description: preview,
            action: {
              label: "Abrir",
              onClick: () => {
                window.location.assign(`/admin/chats`);
              },
            },
          });
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [soundEnabled, shouldNotify, startFlash]);

  // Clear flash when user lands on chats with tab focused
  useEffect(() => {
    if (location.pathname.startsWith("/admin/chats") && document.visibilityState === "visible") {
      markAllRead();
    }
  }, [location.pathname, markAllRead]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && location.pathname.startsWith("/admin/chats")) {
        markAllRead();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [location.pathname, markAllRead]);

  return (
    <NotifContext.Provider value={{ unread, items, markAllRead, remove, soundEnabled, setSoundEnabled }}>
      {children}
    </NotifContext.Provider>
  );
};

export const useAdminNotifications = () => {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error("useAdminNotifications must be inside AdminNotificationsProvider");
  return ctx;
};
