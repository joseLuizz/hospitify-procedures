
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { 
  ClipboardList, 
  UserPlus, 
  Stethoscope, 
  FileText, 
  Home,
  BarChart3
} from "lucide-react";

export function HospitalSidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(true);

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

  return (
    <Sidebar defaultCollapsed={false}>
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
                  <SidebarMenuButton asChild 
                    active={location.pathname === item.path}
                    className={
                      location.pathname === item.path 
                      ? "bg-hospital-primary bg-opacity-10 text-hospital-primary" 
                      : ""
                    }
                  >
                    <Link to={item.path} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
