
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePatients } from "@/contexts/PatientContext";
import { PatientList } from "@/components/PatientList";
import { Pill, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Lista de enfermeiros - Poderia vir de um contexto de usuários no futuro
const nurses = [
  { id: "1", name: "Ana Silva" },
  { id: "2", name: "Carlos Oliveira" },
  { id: "3", name: "Márcia Santos" },
  { id: "4", name: "Paulo Ribeiro" },
  { id: "5", name: "Teresa Gomes" },
];

const medicationSchema = z.object({
  administeringNurse: z.string().min(1, { message: "Selecione um enfermeiro" }),
  specialInstructions: z.string().optional(),
});

type MedicationFormValues = z.infer<typeof medicationSchema>;

const Medication = () => {
  const { 
    getPatientById, 
    getPatientsByStatus, 
    getConsultationDataByPatientId,
    addMedicationData
  } = usePatients();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientId = queryParams.get("id");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [consultationData, setConsultationData] = useState<any>(null);
  
  // Filtramos pacientes que já passaram pela consulta médica
  const completedPatients = getPatientsByStatus("completed");
  
  useEffect(() => {
    if (patientId) {
      const patient = getPatientById(patientId);
      if (patient) {
        setSelectedPatient(patient);
        const consultation = getConsultationDataByPatientId(patient.id);
        if (consultation) {
          setConsultationData(consultation);
        }
      }
    }
  }, [patientId, getPatientById, getConsultationDataByPatientId]);
  
  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      administeringNurse: "",
      specialInstructions: "",
    },
  });

  const onSubmit = async (data: MedicationFormValues) => {
    if (selectedPatient && consultationData) {
      try {
        // Essa função precisará ser implementada no PatientContext
        await addMedicationData({
          patientId: selectedPatient.id,
          administeringNurse: data.administeringNurse,
          specialInstructions: data.specialInstructions,
        });
        
        toast({
          title: "Medicação registrada",
          description: `Medicação registrada com sucesso para ${selectedPatient.name}`,
        });
        
        navigate("/");
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao registrar medicação",
          description: "Ocorreu um erro ao registrar a medicação. Tente novamente.",
        });
      }
    }
  };

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    const consultation = getConsultationDataByPatientId(patient.id);
    if (consultation) {
      setConsultationData(consultation);
    } else {
      toast({
        variant: "destructive",
        title: "Dados de consulta não encontrados",
        description: "Não foi possível encontrar dados de consulta para este paciente.",
      });
    }
    navigate(`/medicacao?id=${patient.id}`);
  };

  if (!selectedPatient && completedPatients.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Medicação</h1>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhum paciente disponível</AlertTitle>
          <AlertDescription>
            Não há pacientes que concluíram a consulta médica no momento.
          </AlertDescription>
        </Alert>
        
        <Button 
          onClick={() => navigate('/consulta')}
          className="bg-hospital-primary hover:bg-hospital-primary/90"
        >
          Ir para Consulta Médica
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Medicação</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-medium">Pacientes com Prescrição</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientList 
                patients={completedPatients} 
                actionText="Selecionar" 
                onAction={handleSelectPatient}
                emptyMessage="Não há pacientes com prescrição"
              />
            </CardContent>
          </Card>
        </div>
        
        {selectedPatient && consultationData && (
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl font-medium flex items-center gap-2">
                    <Pill className="h-5 w-5 text-hospital-primary" />
                    <span>Administração de Medicação</span>
                  </CardTitle>
                  <CardDescription>
                    Paciente: <span className="font-medium">{selectedPatient.name}</span> | CPF: {selectedPatient.cpf}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-muted rounded-md p-4">
                    <h3 className="font-medium mb-2">Prescrição Médica</h3>
                    <p className="text-sm whitespace-pre-line">{consultationData.prescription || "Nenhuma prescrição registrada"}</p>
                  </div>
                  
                  {consultationData.notes && (
                    <div className="bg-muted rounded-md p-4">
                      <h3 className="font-medium mb-2">Observações</h3>
                      <p className="text-sm whitespace-pre-line">{consultationData.notes}</p>
                    </div>
                  )}
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="administeringNurse"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enfermeiro Responsável</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o enfermeiro" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {nurses.map((nurse) => (
                                  <SelectItem key={nurse.id} value={nurse.id}>
                                    {nurse.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="specialInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instruções Especiais</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Adicione instruções especiais se necessário"
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full bg-hospital-primary hover:bg-hospital-primary/90">
                        Registrar Administração
                      </Button>
                    </form>
                  </Form>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medication;
