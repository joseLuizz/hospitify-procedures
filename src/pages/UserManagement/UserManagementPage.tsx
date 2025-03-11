
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUsers } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfileType } from "./types";
import { UserTable } from "./components/UserTable";
import { AddUserDialog } from "./components/AddUserDialog";

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfileType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isAdmin, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem acessar esta página",
        variant: "destructive",
      });
      navigate('/');
    }
    
    if (isAuthenticated && isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate, toast]);

  const fetchUsers = async () => {
    try {
      const { users: fetchedUsers, error } = await getAllUsers();
      if (error) throw error;
      
      // Ensure the fetched users conform to the UserProfileType
      const typedUsers: UserProfileType[] = fetchedUsers?.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role as UserProfileType['role'],
        name: user.name,
        createdAt: user.createdAt
      })) || [];
      
      setUsers(typedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onUserAdded = () => {
    fetchUsers();
    setIsDialogOpen(false);
  };

  if (authLoading) {
    return <div className="flex items-center justify-center h-full">Carregando...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <AddUserDialog 
            isOpen={isDialogOpen} 
            onOpenChange={setIsDialogOpen} 
            onUserAdded={onUserAdded} 
          />
        </CardHeader>
        <CardContent>
          <UserTable 
            users={users} 
            isLoading={isLoading} 
            onUserChange={fetchUsers} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
