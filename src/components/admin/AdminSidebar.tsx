import { LayoutDashboard, ClipboardList, MessageCircle, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Logo } from "@/components/Logo";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

const items = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, key: "dashboard" },
  { title: "Solicitações", url: "/admin/requests", icon: ClipboardList, key: "requests" },
  { title: "Atendimento", url: "/admin/chats", icon: MessageCircle, key: "chats" },
  { title: "Configurações", url: "/admin/settings", icon: Settings, key: "settings" },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { unread } = useAdminNotifications();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className={`p-4 flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
          <Logo invert className="h-7 w-auto shrink-0" />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sm text-sidebar-foreground tracking-tight">Avance Modas</span>
              <span className="text-[10px] text-sidebar-foreground/60">Central de Devoluções</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const showBadge = item.key === "chats" && unread > 0;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/admin"}
                        className="hover:bg-sidebar-accent/50 relative"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                        {showBadge && (
                          <span className={`${collapsed ? "absolute top-1 right-1" : "ml-auto"} min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center`}>
                            {unread > 9 ? "9+" : unread}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
