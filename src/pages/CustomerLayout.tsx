import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NavLink } from "@/components/NavLink";
import { Package, ClipboardList, Plus, LogOut } from "lucide-react";

const CustomerLayout = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-32 h-8" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-tight text-foreground">Avance Modas</span>
              <span className="text-[10px] text-muted-foreground">Central de Trocas e Devoluções</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[180px]">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1">
              <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>

        <nav className="container mx-auto px-4">
          <div className="flex gap-1 -mb-px overflow-x-auto">
            <NavLink to="/minha-conta" end className="flex items-center gap-2 px-3 py-2.5 text-sm border-b-2 border-transparent text-muted-foreground hover:text-foreground" activeClassName="!border-primary !text-primary font-medium">
              <ClipboardList className="w-4 h-4" /> Minhas Solicitações
            </NavLink>
            <NavLink to="/minha-conta/nova" className="flex items-center gap-2 px-3 py-2.5 text-sm border-b-2 border-transparent text-muted-foreground hover:text-foreground" activeClassName="!border-primary !text-primary font-medium">
              <Plus className="w-4 h-4" /> Nova Solicitação
            </NavLink>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
