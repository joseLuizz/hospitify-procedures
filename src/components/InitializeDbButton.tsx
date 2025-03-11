
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const InitializeDbButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInitializeDb = async () => {
    setIsLoading(true);
    try {
      // Step 1: Create the user_profiles table
      const createTableQuery = `
        create table if not exists public.user_profiles (
          id uuid primary key references auth.users,
          email text not null,
          role text not null,
          name text not null,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null
        );
      `;
      
      // This won't work with anon key, but we'll show the SQL for user to run in Supabase SQL editor
      console.log("SQL to create table:", createTableQuery);
      
      // Step 2: We'll try to get the current user
      const { data: authData } = await supabase.auth.getSession();
      const userId = authData.session?.user?.id;
      
      if (!userId) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar o perfil de administrador.",
          variant: "destructive",
        });
        return;
      }
      
      // Step 3: Try to create the admin profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert([{
          id: userId,
          email: 'admin@teste.com',
          role: 'admin',
          name: 'Administrator',
          created_at: new Date().toISOString()
        }]);
        
      if (insertError) {
        if (insertError.message.includes('does not exist')) {
          toast({
            title: "Tabela não existe",
            description: "A tabela user_profiles precisa ser criada no Supabase. Veja o console para o SQL necessário.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao criar perfil",
            description: insertError.message,
            variant: "destructive",
          });
        }
        return;
      }
      
      toast({
        title: "Sucesso",
        description: "Perfil de administrador criado com sucesso!",
      });
      
      // Force page refresh to update the user context
      window.location.reload();
      
    } catch (error: any) {
      console.error("Error initializing DB:", error);
      toast({
        title: "Erro ao inicializar banco de dados",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleInitializeDb} disabled={isLoading}>
      {isLoading ? "Inicializando..." : "Inicializar Banco de Dados e Criar Admin"}
    </Button>
  );
};
