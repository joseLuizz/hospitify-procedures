
import { Patient } from "@/types/patient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PatientDetailsModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

type PatientFormValues = Omit<Patient, 'id' | 'registrationDate' | 'status'>;

export function PatientDetailsModal({ patient, isOpen, onClose }: PatientDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<PatientFormValues>({
    defaultValues: {
      name: patient.name,
      birthDate: patient.birthDate,
      gender: patient.gender,
      cpf: patient.cpf,
      phone: patient.phone,
      address: patient.address,
      healthInsurance: patient.healthInsurance || "",
      emergencyContact: patient.emergencyContact || "",
    },
  });

  const onSubmit = (data: PatientFormValues) => {
    // In a real application, you would update the patient data in your database here
    console.log("Updated patient data:", data);
    
    toast({
      title: "Paciente atualizado",
      description: "Os dados do paciente foram atualizados com sucesso.",
    });
    
    setIsEditing(false);
  };

  const formattedDate = patient.birthDate ? 
    format(new Date(patient.birthDate), 'dd/MM/yyyy') : 'Não informado';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setIsEditing(false);
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Paciente</DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          {...field}
                        >
                          <option value="M">Masculino</option>
                          <option value="F">Feminino</option>
                          <option value="O">Outro</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="healthInsurance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano de Saúde</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato de Emergência</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="sm:justify-between">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <h3 className="text-sm font-semibold text-hospital-primary">Informações Pessoais</h3>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <p className="text-xs text-muted-foreground">Nome:</p>
                    <p className="text-sm">{patient.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CPF:</p>
                    <p className="text-sm">{patient.cpf}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Data de Nascimento:</p>
                    <p className="text-sm">{formattedDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gênero:</p>
                    <p className="text-sm">
                      {patient.gender === 'M' ? 'Masculino' : 
                       patient.gender === 'F' ? 'Feminino' : 'Outro'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-hospital-primary">Contato</h3>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone:</p>
                    <p className="text-sm">{patient.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contato de Emergência:</p>
                    <p className="text-sm">{patient.emergencyContact || "Não informado"}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-hospital-primary">Endereço</h3>
                <p className="text-sm mt-1">{patient.address}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-hospital-primary">Plano de Saúde</h3>
                <p className="text-sm mt-1">{patient.healthInsurance || "Não possui"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-hospital-primary">Status</h3>
                <div className="mt-1">
                  <Badge className={`${statusColors[patient.status]} text-xs px-2 py-1`}>
                    {statusLabels[patient.status]}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-hospital-primary">Data de Registro</h3>
                <p className="text-sm mt-1">
                  {format(new Date(patient.registrationDate), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            </div>
            
            <DialogFooter className="sm:justify-between">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                Editar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

const statusColors = {
  'waiting': 'bg-hospital-warning text-black',
  'in-triage': 'bg-hospital-primary text-white',
  'in-consultation': 'bg-hospital-success text-white',
  'completed': 'bg-gray-400 text-white',
};

const statusLabels = {
  'waiting': 'Aguardando',
  'in-triage': 'Em Triagem',
  'in-consultation': 'Em Consulta',
  'completed': 'Finalizado',
};
