
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { usePatients } from "@/contexts/PatientContext";
import { PatientList } from "@/components/PatientList";
import { Stethoscope, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const triageSchema = z.object({
  bloodPressure: z.string().min(1, { message: "Campo obrigatório" }),
  heartRate: z.number().min(40).max(200),
  temperature: z.number().min(34).max(42),
  oxygenSaturation: z.number().min(70).max(100),
  respiratoryRate: z.number().min(10).max(40),
  painLevel: z.number().min(0).max(10),
  mainComplaints: z.string().min(3, { message: "Campo obrigatório" }),
  allergies: z.string().optional(),
  priorityLevel: z.enum(["low", "medium", "high", "emergency"]),
  notes: z.string().optional(),
  triageBy: z.string().min(3, { message: "Nome do profissional é obrigatório" }),
});

type TriageFormValues = z.infer<typeof triageSchema>;

const Triage = () => {
  const { getPatientById, getPatientsByStatus, addTriageData, updatePatientStatus } = usePatients();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientId = queryParams.get("id");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  const inTriagePatients = getPatientsByStatus("in-triage");
  
  useEffect(() => {
    if (patientId) {
      const patient = getPatientById(patientId);
      if (patient) {
        setSelectedPatient(patient);
        if (patient.status === "waiting") {
          updatePatientStatus(patient.id, "in-triage");
        }
      }
    }
  }, [patientId, getPatientById, updatePatientStatus]);
  
  const form = useForm<TriageFormValues>({
    resolver: zodResolver(triageSchema),
    defaultValues: {
      bloodPressure: "",
      heartRate: 80,
      temperature: 36.5,
      oxygenSaturation: 98,
      respiratoryRate: 16,
      painLevel: 0,
      mainComplaints: "",
      allergies: "",
      priorityLevel: "low",
      notes: "",
      triageBy: "",
    },
  });

  const onSubmit = (data: TriageFormValues) => {
    if (selectedPatient) {
      addTriageData({
        patientId: selectedPatient.id,
        ...data,
      });
      navigate(`/consulta?id=${selectedPatient.id}`);
    }
  };

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    navigate(`/triagem?id=${patient.id}`);
  };

  if (!selectedPatient && inTriagePatients.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Triagem</h1>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhum paciente disponível</AlertTitle>
          <AlertDescription>
            Não há pacientes aguardando ou em triagem no momento.
          </AlertDescription>
        </Alert>
        
        <Button 
          onClick={() => navigate('/atendimento')}
          className="bg-hospital-primary hover:bg-hospital-primary/90"
        >
          Ir para Atendimento
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Triagem</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-medium">Pacientes em Triagem</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientList 
                patients={inTriagePatients} 
                actionText="Selecionar" 
                onAction={handleSelectPatient}
                emptyMessage="Não há pacientes em triagem"
              />
            </CardContent>
          </Card>
        </div>
        
        {selectedPatient && (
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl font-medium flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-hospital-primary" />
                    <span>Formulário de Triagem</span>
                  </CardTitle>
                  <CardDescription>
                    Paciente: <span className="font-medium">{selectedPatient.name}</span> | CPF: {selectedPatient.cpf}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bloodPressure"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pressão Arterial</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 120/80 mmHg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="heartRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequência Cardíaca (bpm): {field.value}</FormLabel>
                            <FormControl>
                              <Slider 
                                min={40} 
                                max={200} 
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="temperature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Temperatura (°C): {field.value}</FormLabel>
                            <FormControl>
                              <Slider 
                                min={34} 
                                max={42} 
                                step={0.1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="oxygenSaturation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Saturação de O2 (%): {field.value}</FormLabel>
                            <FormControl>
                              <Slider 
                                min={70} 
                                max={100} 
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="respiratoryRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequência Respiratória: {field.value}</FormLabel>
                            <FormControl>
                              <Slider 
                                min={10} 
                                max={40} 
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="painLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nível de Dor (0-10): {field.value}</FormLabel>
                            <FormControl>
                              <Slider 
                                min={0} 
                                max={10} 
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="priorityLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nível de Prioridade</FormLabel>
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
                                <SelectItem value="low">Baixa</SelectItem>
                                <SelectItem value="medium">Média</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                                <SelectItem value="emergency">Emergência</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="triageBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profissional Responsável</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do profissional" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="mainComplaints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Queixas Principais</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva as queixas principais do paciente"
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alergias</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Liste alergias conhecidas (se houver)"
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Observações adicionais"
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full bg-hospital-primary hover:bg-hospital-primary/90">
                      Concluir Triagem e Enviar para Consulta
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Triage;
