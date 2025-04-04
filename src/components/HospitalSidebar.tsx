
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar";
import { 
  ClipboardList, 
  UserPlus, 
  Stethoscope, 
  FileText, 
  Home,
  BarChart3,
  Users,
  LogOut,
  Menu,
  Pill
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

export function HospitalSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const { user, isAdmin, signOut } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      path: "/",
      icon: Home,
    },
    {
      title: "Atendimento",
      path: "/atendimento",
      icon: UserPlus,
    },
    {
      title: "Triagem",
      path: "/triagem",
      icon: Stethoscope,
    },
    {
      title: "Consulta Médica",
      path: "/consulta",
      icon: FileText,
    },
    {
      title: "Medicação",
      path: "/medicacao",
      icon: Pill,
    },
    {
      title: "Relatórios",
      path: "/relatorios",
      icon: BarChart3,
    }
  ];

  // Add user management link for admin users
  if (isAdmin) {
    menuItems.push({
      title: "Gerenciar Usuários",
      path: "/usuarios",
      icon: Users,
    });
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader className="border-b border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-hospital-primary" />
            <h2 className="text-lg font-medium">Hospital System</h2>
          </div>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          {user && (
            <SidebarGroup>
              <div className="flex items-center gap-3 p-4 border-b border-slate-200">
                <Avatar>
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={user.name} />
                  ) : (
                    <AvatarFallback className="bg-hospital-primary text-white">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
            </SidebarGroup>
          )}
          
          <SidebarGroup>
            <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Link 
                      to={item.path}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md hover:bg-hospital-primary/10",
                        location.pathname === item.path && "bg-hospital-primary bg-opacity-10 text-hospital-primary"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        {user && (
          <SidebarFooter className="border-t border-slate-200 p-4">
            <SidebarMenuButton 
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Sair</span>
            </SidebarMenuButton>
          </SidebarFooter>
        )}
        
        <SidebarRail />
      </Sidebar>
      
      {/* Add a floating expand button when sidebar is collapsed */}
      {state === "collapsed" && (
        <div className="fixed top-4 left-2 z-20 md:flex hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const trigger = document.querySelector('[data-sidebar="trigger"]') as HTMLButtonElement;
              if (trigger) trigger.click();
            }}
            className="h-8 w-8 rounded-full bg-white shadow-md border border-slate-200"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Expandir menu</span>
          </Button>
        </div>
      )}
    </>
  );
}
