
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
import { Stethoscope, AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const triageSchema = z.object({
  date: z.string(),
  time: z.string(),
  reclassified: z.string().optional(),
  
  // 1. Queixa Principal/Motivo do Atendimento
  mainComplaints: z.string().min(3, { message: "Campo obrigatório" }),
  
  // Alergias e Medicação
  allergies: z.string().default(""),
  regularMedication: z.string().default(""),
  
  // 2. Sinais Vitais
  bloodPressure: z.string().min(1, { message: "Campo obrigatório" }),
  heartRate: z.number().min(40).max(200),
  respiratoryRate: z.number().min(10).max(40),
  oxygenSaturation: z.number().min(70).max(100),
  temperature: z.number().min(34).max(42),
  glucose: z.number().min(40).max(500).optional(),
  
  // 3. Escala de Coma de Glasgow
  ocularOpening: z.number().min(1).max(4),
  verbalResponse: z.number().min(1).max(5),
  motorResponse: z.number().min(1).max(6),
  
  // Reatividade pupilar
  pupilReactivity: z.enum(["inexistente", "unilateral", "bilateral"]),
  
  // 4. Escala de Dor
  painLevel: z.number().min(0).max(10),
  
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
  const [glasgowTotal, setGlasgowTotal] = useState(15);
  
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
  
  const currentDate = format(new Date(), "yyyy-MM-dd");
  const currentTime = format(new Date(), "HH:mm");
  
  const form = useForm<TriageFormValues>({
    resolver: zodResolver(triageSchema),
    defaultValues: {
      date: currentDate,
      time: currentTime,
      reclassified: "",
      mainComplaints: "",
      allergies: "",
      regularMedication: "",
      bloodPressure: "",
      heartRate: 80,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      temperature: 36.5,
      glucose: undefined,
      ocularOpening: 4,
      verbalResponse: 5,
      motorResponse: 6,
      pupilReactivity: "bilateral",
      painLevel: 0,
      priorityLevel: "low",
      notes: "",
      triageBy: "",
    },
  });

  // Calcular o total de Glasgow quando os valores mudarem
  const ocularOpening = form.watch("ocularOpening");
  const verbalResponse = form.watch("verbalResponse");
  const motorResponse = form.watch("motorResponse");
  
  useEffect(() => {
    const total = ocularOpening + verbalResponse + motorResponse;
    setGlasgowTotal(total);
  }, [ocularOpening, verbalResponse, motorResponse]);

  const onSubmit = (data: TriageFormValues) => {
    if (selectedPatient) {
      addTriageData({
        patientId: selectedPatient.id,
        ...data,
        glasgowTotal,
      });
      navigate(`/consulta?id=${selectedPatient.id}`);
    }
  };

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    navigate(`/triagem?id=${patient.id}`);
  };

  // Definir a classificação de trauma com base no total de Glasgow
  const getTraumaLevel = () => {
    if (glasgowTotal >= 13 && glasgowTotal <= 15) return "Trauma leve";
    if (glasgowTotal >= 9 && glasgowTotal <= 12) return "Trauma moderado";
    if (glasgowTotal >= 3 && glasgowTotal <= 8) return "Trauma grave";
    return "";
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
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Cabeçalho com data e hora */}
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="reclassified"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reclassificado? (Cor)</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Amarelo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* 1. Queixa Principal/Motivo do Atendimento */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">1. Queixa Principal/Motivo do Atendimento</h3>
                      <FormField
                        control={form.control}
                        name="mainComplaints"
                        render={({ field }) => (
                          <FormItem>
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
                    </div>
                    
                    {/* Alergias e Medicação de Uso Regular */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alergias</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Liste alergias conhecidas (se houver)"
                                className="min-h-[60px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="regularMedication"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medicação de Uso Regular</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Liste medicamentos de uso regular"
                                className="min-h-[60px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* 2. Sinais Vitais */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">2. Sinais Vitais</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="bloodPressure"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PA (mmHg)</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: 120/80" {...field} />
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
                              <FormLabel>FC (bpm): {field.value}</FormLabel>
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
                          name="respiratoryRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>FR (rpm): {field.value}</FormLabel>
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
                          name="oxygenSaturation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SpO2 (%): {field.value}</FormLabel>
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
                          name="temperature"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>T (°C): {field.value}</FormLabel>
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
                          name="glucose"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Glicemia (mg/dL): {field.value || "Não aferida"}</FormLabel>
                              <FormControl>
                                <Slider 
                                  min={40} 
                                  max={500} 
                                  step={1}
                                  value={field.value ? [field.value] : [100]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* 3. Escala de Coma de Glasgow */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">3. Escala de Coma de Glasgow</h3>
                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Abertura Ocular</h4>
                            <FormField
                              control={form.control}
                              name="ocularOpening"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={(val) => field.onChange(parseInt(val))}
                                      defaultValue={field.value.toString()}
                                      className="space-y-1"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="4" id="eo-4" />
                                        <Label htmlFor="eo-4">4 - Espontânea</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="3" id="eo-3" />
                                        <Label htmlFor="eo-3">3 - Ao som</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="2" id="eo-2" />
                                        <Label htmlFor="eo-2">2 - À pressão</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="1" id="eo-1" />
                                        <Label htmlFor="eo-1">1 - Ausente</Label>
                                      </div>
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Resposta Verbal</h4>
                            <FormField
                              control={form.control}
                              name="verbalResponse"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={(val) => field.onChange(parseInt(val))}
                                      defaultValue={field.value.toString()}
                                      className="space-y-1"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="5" id="rv-5" />
                                        <Label htmlFor="rv-5">5 - Orientado</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="4" id="rv-4" />
                                        <Label htmlFor="rv-4">4 - Confuso</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="3" id="rv-3" />
                                        <Label htmlFor="rv-3">3 - Palavras inapropriadas</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="2" id="rv-2" />
                                        <Label htmlFor="rv-2">2 - Sons incompreensíveis</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="1" id="rv-1" />
                                        <Label htmlFor="rv-1">1 - Ausente</Label>
                                      </div>
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Resposta Motora</h4>
                            <FormField
                              control={form.control}
                              name="motorResponse"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={(val) => field.onChange(parseInt(val))}
                                      defaultValue={field.value.toString()}
                                      className="space-y-1"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="6" id="rm-6" />
                                        <Label htmlFor="rm-6">6 - Obedece a ordens</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="5" id="rm-5" />
                                        <Label htmlFor="rm-5">5 - Localiza a dor</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="4" id="rm-4" />
                                        <Label htmlFor="rm-4">4 - Flexão normal</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="3" id="rm-3" />
                                        <Label htmlFor="rm-3">3 - Flexão anormal</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="2" id="rm-2" />
                                        <Label htmlFor="rm-2">2 - Extensão anormal</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="1" id="rm-1" />
                                        <Label htmlFor="rm-1">1 - Ausente</Label>
                                      </div>
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <div className="bg-gray-100 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">GLASGOW:</span>
                            <span className="font-bold text-lg">{glasgowTotal}</span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                            <div className="text-center p-2 bg-green-50 rounded">
                              <div className="font-medium">Trauma leve</div>
                              <div className="mt-1">13-15</div>
                            </div>
                            <div className="text-center p-2 bg-yellow-50 rounded">
                              <div className="font-medium">Trauma moderado</div>
                              <div className="mt-1">9-12</div>
                            </div>
                            <div className="text-center p-2 bg-red-50 rounded">
                              <div className="font-medium">Trauma grave</div>
                              <div className="mt-1">3-8</div>
                            </div>
                          </div>
                          
                          <div className="mt-3 p-2 bg-blue-50 rounded">
                            <div className="font-medium">Classificação: <span className="font-bold">{getTraumaLevel()}</span></div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="font-medium text-sm mb-2">Reatividade pupilar</h4>
                          <FormField
                            control={form.control}
                            name="pupilReactivity"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-3 gap-4"
                                  >
                                    <div className="flex items-center justify-center space-x-2 p-2 border rounded">
                                      <RadioGroupItem value="inexistente" id="pr-0" />
                                      <Label htmlFor="pr-0">Inexistente</Label>
                                    </div>
                                    <div className="flex items-center justify-center space-x-2 p-2 border rounded">
                                      <RadioGroupItem value="unilateral" id="pr-1" />
                                      <Label htmlFor="pr-1">Unilateral</Label>
                                    </div>
                                    <div className="flex items-center justify-center space-x-2 p-2 border rounded">
                                      <RadioGroupItem value="bilateral" id="pr-2" />
                                      <Label htmlFor="pr-2">Bilateral</Label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* 4. Escala de Dor */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">4. Escala de Dor</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <FormField
                          control={form.control}
                          name="painLevel"
                          render={({ field }) => (
                            <FormItem>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <FormLabel>Intensidade da dor: <strong>{field.value}/10</strong></FormLabel>
                                </div>
                                
                                <div className="flex items-center gap-1 mb-2">
                                  <img src="/public/lovable-uploads/dbfbc239-f039-45b1-bdef-75a046188fb4.png" 
                                    alt="Escala de dor" 
                                    className="w-full max-h-16 object-contain" />
                                </div>
                                
                                <FormControl>
                                  <Slider 
                                    min={0} 
                                    max={10} 
                                    step={1}
                                    value={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    className="mt-2"
                                  />
                                </FormControl>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Sem dor</span>
                                  <span>Dor moderada</span>
                                  <span>Pior dor possível</span>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Nível de Prioridade */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <SelectItem value="low">Baixa (Verde)</SelectItem>
                                <SelectItem value="medium">Média (Amarelo)</SelectItem>
                                <SelectItem value="high">Alta (Laranja)</SelectItem>
                                <SelectItem value="emergency">Emergência (Vermelho)</SelectItem>
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
                            <FormLabel>Enfermeiro Responsável</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do enfermeiro" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações Adicionais</FormLabel>
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
                    
                    <div className="border-t pt-4">
                      <Button type="submit" className="w-full bg-hospital-primary hover:bg-hospital-primary/90">
                        Concluir Triagem e Enviar para Consulta
                      </Button>
                    </div>
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
