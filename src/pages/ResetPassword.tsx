import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const passwordSchema = z.string().min(6, "A senha deve ter pelo menos 6 caracteres.").max(72, "A senha deve ter no máximo 72 caracteres.");

type RecoveryState = "checking" | "ready" | "invalid" | "complete";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") === "admin" ? "admin" : "customer";
  const returnPath = source === "admin" ? "/admin/login" : "/auth";
  const [state, setState] = useState<RecoveryState>("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const isRecoveryLink = hashParams.get("type") === "recovery";

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || (isRecoveryLink && session)) setState("ready");
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setState(isRecoveryLink && session ? "ready" : "invalid");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const parsedPassword = passwordSchema.safeParse(password);
    if (!parsedPassword.success) {
      setError(parsedPassword.error.issues[0]?.message ?? "Senha inválida.");
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    setError("");
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: parsedPassword.data });
    setLoading(false);

    if (updateError) {
      setError("Não foi possível alterar a senha. Solicite um novo link e tente novamente.");
      return;
    }

    await supabase.auth.signOut();
    setState("complete");
  };

  if (state === "checking") {
    return (
      <main className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Validando link" />
      </main>
    );
  }

  return (
    <main className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <Card className="glass-card w-full max-w-md">
        <CardHeader className="text-center">
          <Logo className="h-12 w-auto mx-auto mb-2" />
          <CardTitle className="text-2xl">{state === "ready" ? "Criar nova senha" : state === "complete" ? "Senha alterada" : "Link inválido"}</CardTitle>
          <CardDescription>
            {state === "ready" && "Escolha uma nova senha para sua conta."}
            {state === "complete" && "Sua nova senha já pode ser usada para entrar."}
            {state === "invalid" && "Este link expirou, já foi usado ou não é um link de recuperação."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state === "ready" ? (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => { setPassword(event.target.value); if (error) setError(""); }} disabled={loading} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <Input id="confirm-password" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); if (error) setError(""); }} aria-invalid={Boolean(error)} aria-describedby={error ? "password-error" : undefined} disabled={loading} required />
                {error && <p id="password-error" className="text-sm text-destructive">{error}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                Salvar nova senha
              </Button>
            </form>
          ) : (
            <div className="space-y-5 text-center">
              {state === "complete" && <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />}
              <Button className="w-full" onClick={() => navigate(state === "invalid" ? `/forgot-password?source=${source}` : returnPath)}>
                {state === "invalid" ? "Solicitar novo link" : "Entrar com a nova senha"}
              </Button>
              {state === "invalid" && <Button asChild variant="ghost" className="w-full"><Link to={returnPath}>Voltar para entrar</Link></Button>}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default ResetPassword;
