import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    let roleRequestId = 0;
    let currentUserId: string | null = null;
    let initialized = false;

    const resolveAdminState = async (userId: string, withLoading: boolean) => {
      const requestId = ++roleRequestId;
      if (withLoading) setLoading(true);

      const { data, error } = await supabase.rpc("is_admin", { _user_id: userId });

      if (!active || requestId !== roleRequestId) return;

      setIsAdmin(!error && !!data);
      setLoading(false);
    };

    const applySession = (session: Session | null) => {
      const nextUser = session?.user ?? null;
      const nextId = nextUser?.id ?? null;
      const userChanged = nextId !== currentUserId;
      const isInitial = !initialized;
      initialized = true;

      // Skip re-renders/role refetch on token refresh for the same user
      // (prevents wizard state loss after the mobile file picker backgrounds the page).
      if (!userChanged && !isInitial) {
        setLoading(false);
        return;
      }

      currentUserId = nextId;
      setUser(nextUser);

      if (!nextUser) {
        roleRequestId += 1;
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      void resolveAdminState(nextUser.id, isInitial);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      applySession(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, isAdmin, signOut };
}
