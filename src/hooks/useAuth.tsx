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
    let resolvedUserId: string | null = null;
    let initialized = false;

    const resolveAdminState = async (userId: string, withLoading: boolean) => {
      const requestId = ++roleRequestId;
      if (withLoading) setLoading(true);

      const { data, error } = await supabase.rpc("is_admin", { _user_id: userId });

      if (!active || requestId !== roleRequestId) return;

      resolvedUserId = userId;
      setIsAdmin(!error && !!data);
      setLoading(false);
    };

    const applySession = (session: Session | null) => {
      const nextUser = session?.user ?? null;
      const nextId = nextUser?.id ?? null;
      const userChanged = nextId !== currentUserId;

      // Skip re-renders/role refetch when the same user is reported again
      // (e.g. token refresh after mobile file picker, or the duplicate
      // INITIAL_SESSION + getSession delivery). Only short-circuit once
      // the role has actually been resolved for this user — otherwise we
      // would flip loading=false before is_admin returns and bounce admins
      // to the login screen.
      if (!userChanged && nextId !== null && resolvedUserId === nextId) {
        setLoading(false);
        return;
      }
      if (!userChanged && nextId === null && initialized) {
        setLoading(false);
        return;
      }

      initialized = true;
      currentUserId = nextId;
      setUser(nextUser);

      if (!nextUser) {
        roleRequestId += 1;
        resolvedUserId = null;
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      void resolveAdminState(nextUser.id, true);
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
