
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
  SidebarTrigger,
  SidebarRail
} from "@/components/ui/sidebar";
import { 
  ClipboardList, 
  UserPlus, 
  Stethoscope, 
  FileText, 
  Home,
  BarChart3,
  Users,
  PanelLeft,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function HospitalSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  // Remove isAdmin dependency and set to true for now since we're not using authentication
  const isAdmin = true;

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
        <SidebarRail />
      </Sidebar>
      
      {/* Add a floating expand button when sidebar is collapsed */}
      {state === "collapsed" && (
        <div className="fixed top-4 left-2 z-20 md:flex hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => document.querySelector('[data-sidebar="trigger"]')?.click()}
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
