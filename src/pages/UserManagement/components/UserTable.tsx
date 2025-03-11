
import { useToast } from "@/hooks/use-toast";
import { deleteUser, updateUserRole } from "@/lib/database";
import { UserProfileType } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface UserTableProps {
  users: UserProfileType[];
  isLoading: boolean;
  onUserChange: () => void;
}

export function UserTable({ users, isLoading, onUserChange }: UserTableProps) {
  const { toast } = useToast();
  
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await updateUserRole(userId, newRole);
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "O perfil do usuário foi atualizado com sucesso",
      });
      
      onUserChange();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Não foi possível atualizar o perfil do usuário",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    
    try {
      const { error } = await deleteUser(userId);
      if (error) throw error;
      
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso",
      });
      
      onUserChange();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Erro ao excluir usuário",
        description: "Não foi possível excluir o usuário",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Carregando usuários...</div>;
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Perfil</TableHead>
          <TableHead>Data de Criação</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              Nenhum usuário encontrado
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  defaultValue={user.role}
                  onValueChange={(value) => handleRoleChange(user.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tec enfermagem">Técnico de Enfermagem</SelectItem>
                    <SelectItem value="enfermeiro">Enfermeiro</SelectItem>
                    <SelectItem value="medico">Médico</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
