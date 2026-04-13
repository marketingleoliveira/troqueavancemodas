import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", currentUser.id);

          setIsAdmin(
            roles?.some(r => r.role === "super_admin" || r.role === "admin") ?? false
          );
        } else {
          setIsAdmin(false);
        }

        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentUser.id)
          .then(({ data: roles }) => {
            setIsAdmin(
              roles?.some(r => r.role === "super_admin" || r.role === "admin") ?? false
            );
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, isAdmin, signOut };
}
