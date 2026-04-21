import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();

  // If already authenticated as admin, skip the form
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active || !session?.user) return;
      const { data: allowed } = await checkAdmin(session.user.id);
      if (active && allowed) navigate("/admin", { replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  const checkAdmin = async (userId: string) => {
    const [{ data: isSuper, error: e1 }, { data: isAdmin, error: e2 }] = await Promise.all([
      supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
      supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    ]);
    return { data: !!isSuper || !!isAdmin, error: e1 ?? e2 ?? null };
  };

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = "Informe seu e-mail.";
    else if (!EMAIL_REGEX.test(email.trim())) errors.email = "E-mail inválido.";
    if (!password) errors.password = "Informe sua senha.";
    else if (password.length < 6) errors.password = "A senha deve ter pelo menos 6 caracteres.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    setLoading(true);

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !signInData?.user) {
      const msg = error?.message?.toLowerCase() ?? "";
      const description = msg.includes("invalid")
        ? "E-mail ou senha incorretos."
        : msg.includes("email not confirmed")
        ? "Confirme seu e-mail antes de entrar."
        : msg.includes("network")
        ? "Falha de conexão. Verifique sua internet e tente novamente."
        : "Não foi possível entrar. Verifique seus dados e tente novamente.";
      toast.error("Erro ao entrar", { description });
      setLoading(false);
      return;
    }

    // Wait for the session to be persisted (avoids race with RLS / has_role)
    let userId = signInData.user.id;
    for (let i = 0; i < 10; i++) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        userId = session.user.id;
        break;
      }
      await new Promise((r) => setTimeout(r, 100));
    }

    const { data: allowed, error: roleError } = await checkAdmin(userId);

    if (roleError) {
      toast.error("Erro ao validar permissões", {
        description: "Tente novamente em instantes.",
      });
      setLoading(false);
      return;
    }

    if (!allowed) {
      await supabase.auth.signOut();
      toast.error("Acesso negado", {
        description: "Sua conta não tem permissão para acessar o painel da equipe.",
      });
      setLoading(false);
      return;
    }

    toast.success("Bem-vindo de volta!");
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Logo className="h-12 w-auto mx-auto mb-2" />
          <CardTitle className="text-2xl">Avance Modas</CardTitle>
          <CardDescription>Painel de Devoluções — Acesso restrito à equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                }}
                aria-invalid={!!fieldErrors.email}
                disabled={loading}
              />
              {fieldErrors.email && (
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                }}
                aria-invalid={!!fieldErrors.password}
                disabled={loading}
              />
              {fieldErrors.password && (
                <p className="text-xs text-destructive">{fieldErrors.password}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
