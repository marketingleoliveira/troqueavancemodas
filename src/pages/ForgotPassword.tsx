import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { z } from "zod";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.string().trim().email("Informe um e-mail válido.").max(255);

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") === "admin" ? "admin" : "customer";
  const returnPath = source === "admin" ? "/admin/login" : "/auth";
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      setError(parsedEmail.error.issues[0]?.message ?? "Informe um e-mail válido.");
      return;
    }

    setError("");
    setLoading(true);
    const redirectTo = `${window.location.origin}/reset-password?source=${source}`;
    const { error: requestError } = await supabase.auth.resetPasswordForEmail(parsedEmail.data, { redirectTo });
    setLoading(false);

    if (requestError) {
      setError("Não foi possível enviar o link agora. Tente novamente em instantes.");
      return;
    }

    setSent(true);
  };

  return (
    <main className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <Card className="glass-card w-full max-w-md">
        <CardHeader className="text-center">
          <Logo className="h-12 w-auto mx-auto mb-2" />
          <CardTitle className="text-2xl">Recuperar senha</CardTitle>
          <CardDescription>
            {sent ? "Enviamos as instruções para o e-mail informado." : "Digite seu e-mail para receber um link seguro."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-5 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Confira também a caixa de spam. O link expira por segurança.
              </p>
              <Button asChild className="w-full">
                <Link to={returnPath}>Voltar para entrar</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="recovery-email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="recovery-email"
                    type="email"
                    autoComplete="email"
                    className="pl-9"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError("");
                    }}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "recovery-error" : undefined}
                    disabled={loading}
                    required
                  />
                </div>
                {error && <p id="recovery-error" className="text-sm text-destructive">{error}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                Enviar link de recuperação
              </Button>
              <Button asChild type="button" variant="ghost" className="w-full">
                <Link to={returnPath}><ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />Voltar para entrar</Link>
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default ForgotPassword;
