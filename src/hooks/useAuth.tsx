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

    const resolveAdminState = async (userId: string) => {
      const requestId = ++roleRequestId;
      setLoading(true);

      const { data, error } = await supabase.rpc("is_admin", { _user_id: userId });

      if (!active || requestId !== roleRequestId) return;

      setIsAdmin(!error && !!data);
      setLoading(false);
    };

    const applySession = (session: Session | null) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) {
        roleRequestId += 1;
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      void resolveAdminState(currentUser.id);
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
