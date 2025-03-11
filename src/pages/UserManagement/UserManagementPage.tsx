
import { useState, useEffect } from "react";
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

  useEffect(() => {
    fetchUsers();
  }, []);

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
