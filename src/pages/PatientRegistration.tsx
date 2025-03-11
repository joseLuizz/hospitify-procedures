
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatients } from "@/contexts/PatientContext";
import { PatientList } from "@/components/PatientList";
import { UserPlus } from "lucide-react";
import { Patient } from "@/types/patient";

const patientSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Formato válido: AAAA-MM-DD" }),
  gender: z.enum(["M", "F", "O"], { message: "Selecione um gênero" }),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: "Formato válido: 123.456.789-00" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  address: z.string().min(5, { message: "Endereço muito curto" }),
  healthInsurance: z.string().optional(),
  emergencyContact: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

const PatientRegistration = () => {
  const { addPatient, getPatientsByStatus, updatePatientStatus } = usePatients();
  const navigate = useNavigate();
  const waitingPatients = getPatientsByStatus("waiting");
  
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      birthDate: "",
      gender: "M",
      cpf: "",
      phone: "",
      address: "",
      healthInsurance: "",
      emergencyContact: "",
    },
  });

  const onSubmit = (data: PatientFormValues) => {
    // Ensure all required fields are present
    const patientData: Omit<Patient, 'id' | 'registrationDate' | 'status'> = {
      name: data.name,
      birthDate: data.birthDate,
      gender: data.gender,
      cpf: data.cpf,
      phone: data.phone,
      address: data.address,
      healthInsurance: data.healthInsurance,
      emergencyContact: data.emergencyContact,
    };
    
    addPatient(patientData);
    form.reset();
  };

  const handleStartTriage = (patient: any) => {
    updatePatientStatus(patient.id, "in-triage");
    navigate(`/triagem?id=${patient.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Atendimento</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-hospital-primary" />
                  <span>Cadastro de Paciente</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="João da Silva" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl>
                            <Input type="date" placeholder="AAAA-MM-DD" {...field} />
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
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="M">Masculino</SelectItem>
                              <SelectItem value="F">Feminino</SelectItem>
                              <SelectItem value="O">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input placeholder="123.456.789-00" {...field} />
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
                            <Input placeholder="(11) 98765-4321" {...field} />
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
                            <Input placeholder="Rua, número, bairro" {...field} />
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
                            <Input placeholder="Nome do plano (opcional)" {...field} />
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
                            <Input placeholder="Nome e telefone (opcional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-hospital-primary hover:bg-hospital-primary/90">
                    Cadastrar Paciente
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-medium">Pacientes Aguardando Triagem</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientList 
                patients={waitingPatients} 
                actionText="Iniciar Triagem" 
                onAction={handleStartTriage}
                emptyMessage="Não há pacientes aguardando triagem"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;
