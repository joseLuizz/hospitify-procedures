
import React from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HospitalSidebar } from "./HospitalSidebar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { toast } = useToast();
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do sistema",
      });
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Erro ao sair",
        description: "Não foi possível realizar o logout",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-hospital-light">
        <HospitalSidebar />
        <div className="flex-1 flex flex-col">
          {isAuthenticated && (
            <header className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-2">
                <User size={20} className="text-hospital-primary" />
                <span className="font-medium">{profile?.name || user?.email}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {profile?.role === 'admin'
                    ? 'Administrador'
                    : profile?.role === 'medico'
                    ? 'Médico'
                    : profile?.role === 'enfermeiro'
                    ? 'Enfermeiro'
                    : 'Técnico de Enfermagem'}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </header>
          )}
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
