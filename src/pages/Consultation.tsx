
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { usePatients } from "@/contexts/PatientContext";
import { PatientList } from "@/components/PatientList";
import { FileText, AlertCircle, Stethoscope } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const consultationSchema = z.object({
  symptoms: z.string().min(3, { message: "Campo obrigatório" }),
  diagnosis: z.string().min(3, { message: "Campo obrigatório" }),
  treatment: z.string().min(3, { message: "Campo obrigatório" }),
  prescription: z.string().min(3, { message: "Campo obrigatório" }),
  exams: z.string().optional(),
  notes: z.string().optional(),
  followUp: z.string().optional(),
  doctorName: z.string().min(3, { message: "Nome do médico é obrigatório" }),
});

type ConsultationFormValues = z.infer<typeof consultationSchema>;

const Consultation = () => {
  const { 
    getPatientById, 
    getPatientsByStatus, 
    getTriageDataByPatientId,
    addConsultationData 
  } = usePatients();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientId = queryParams.get("id");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [triageData, setTriageData] = useState<any>(null);
  
  const inConsultationPatients = getPatientsByStatus("in-consultation");
  
  useEffect(() => {
    if (patientId) {
      const patient = getPatientById(patientId);
      if (patient) {
        setSelectedPatient(patient);
        const triage = getTriageDataByPatientId(patient.id);
        if (triage) {
          setTriageData(triage);
        }
      }
    }
  }, [patientId, getPatientById, getTriageDataByPatientId]);
  
  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      symptoms: "",
      diagnosis: "",
      treatment: "",
      prescription: "",
      exams: "",
      notes: "",
      followUp: "",
      doctorName: "",
    },
  });

  const onSubmit = (data: ConsultationFormValues) => {
    if (selectedPatient) {
      addConsultationData({
        patientId: selectedPatient.id,
        ...data,
      });
      navigate("/");
    }
  };

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    const triage = getTriageDataByPatientId(patient.id);
    if (triage) {
      setTriageData(triage);
    }
    navigate(`/consulta?id=${patient.id}`);
  };

  const priorityColorMap: any = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    emergency: "bg-red-100 text-red-800",
  };
  
  const priorityLabelMap: any = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    emergency: "Emergência",
  };

  if (!selectedPatient && inConsultationPatients.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Consulta Médica</h1>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nenhum paciente disponível</AlertTitle>
          <AlertDescription>
            Não há pacientes aguardando consulta médica no momento.
          </AlertDescription>
        </Alert>
        
        <Button 
          onClick={() => navigate('/triagem')}
          className="bg-hospital-primary hover:bg-hospital-primary/90"
        >
          Ir para Triagem
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Consulta Médica</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-medium">Pacientes Aguardando Consulta</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientList 
                patients={inConsultationPatients} 
                actionText="Atender" 
                onAction={handleSelectPatient}
                emptyMessage="Não há pacientes aguardando consulta"
              />
            </CardContent>
          </Card>
          
          {selectedPatient && triageData && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-medium flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-hospital-primary" />
                  <span>Dados da Triagem</span>
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-semibold">Prioridade:</span>
                  <Badge className={priorityColorMap[triageData.priorityLevel]}>
                    {priorityLabelMap[triageData.priorityLevel]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">Sinais Vitais:</h3>
                    <ul className="text-sm space-y-1 mt-1">
                      <li>PA: {triageData.bloodPressure}</li>
                      <li>FC: {triageData.heartRate} bpm</li>
                      <li>Temperatura: {triageData.temperature}°C</li>
                      <li>SatO2: {triageData.oxygenSaturation}%</li>
                      <li>FR: {triageData.respiratoryRate} irpm</li>
                      <li>Dor: {triageData.painLevel}/10</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold">Queixas Principais:</h3>
                    <p className="text-sm mt-1">{triageData.mainComplaints}</p>
                  </div>
                  
                  {triageData.allergies && (
                    <div>
                      <h3 className="text-sm font-semibold">Alergias:</h3>
                      <p className="text-sm mt-1">{triageData.allergies}</p>
                    </div>
                  )}
                  
                  {triageData.notes && (
                    <div>
                      <h3 className="text-sm font-semibold">Observações:</h3>
                      <p className="text-sm mt-1">{triageData.notes}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-semibold">Triagem realizada por:</h3>
                    <p className="text-sm mt-1">{triageData.triageBy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {selectedPatient && (
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl font-medium flex items-center gap-2">
                    <FileText className="h-5 w-5 text-hospital-primary" />
                    <span>Formulário de Consulta</span>
                  </CardTitle>
                  <CardDescription>
                    Paciente: <span className="font-medium">{selectedPatient.name}</span> | CPF: {selectedPatient.cpf}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="doctorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Médico Responsável</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do médico" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="symptoms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sintomas</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Descreva os sintomas detalhadamente"
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
                        name="diagnosis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Diagnóstico</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Diagnóstico do paciente"
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
                        name="treatment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tratamento</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Descreva o tratamento recomendado"
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
                        name="prescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prescrição Médica</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Liste os medicamentos prescritos"
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
                        name="exams"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exames Solicitados</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Liste exames solicitados (se houver)"
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
                        name="followUp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Acompanhamento</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Recomendações para acompanhamento"
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
                    </div>
                    
                    <Button type="submit" className="w-full bg-hospital-primary hover:bg-hospital-primary/90">
                      Finalizar Consulta
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

export default Consultation;
