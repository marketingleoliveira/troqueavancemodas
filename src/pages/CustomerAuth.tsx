import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().trim().email("E-mail inválido").max(255);
const passwordSchema = z.string().min(6, "Mínimo de 6 caracteres").max(72);
const nameSchema = z.string().trim().min(2, "Informe seu nome").max(100);

const CustomerAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/minha-conta", { replace: true });
    });
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameSchema.safeParse(signupData.name);
    const email = emailSchema.safeParse(signupData.email);
    const password = passwordSchema.safeParse(signupData.password);
    if (!name.success || !email.success || !password.success) {
      toast.error(name.error?.issues[0]?.message || email.error?.issues[0]?.message || password.error?.issues[0]?.message || "Dados inválidos");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.data,
      password: password.data,
      options: {
        emailRedirectTo: `${window.location.origin}/minha-conta`,
        data: { display_name: name.data },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("registered") ? "Este e-mail já está cadastrado." : error.message);
      return;
    }
    toast.success("Cadastro realizado! Verifique seu e-mail para confirmar.");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.email.trim(),
      password: loginData.password,
    });
    setLoading(false);
    if (error) {
      toast.error("E-mail ou senha incorretos.");
      return;
    }
    navigate("/minha-conta", { replace: true });
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/minha-conta`,
    });
    if (result.error) {
      toast.error("Erro ao entrar com Google.");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate("/minha-conta", { replace: true });
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <Card className="glass-card w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Avance Modas — Central de Trocas</CardTitle>
          <CardDescription>Acesse para solicitar troca ou devolução do seu pedido</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input id="login-email" type="email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input id="login-password" type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome completo</Label>
                  <Input id="signup-name" value={signupData.name} onChange={(e) => setSignupData({ ...signupData, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-mail</Label>
                  <Input id="signup-email" type="email" value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input id="signup-password" type="password" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} required />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">ou</span></div>
          </div>

          <Button type="button" variant="outline" onClick={handleGoogle} disabled={loading} className="w-full gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuar com Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerAuth;
