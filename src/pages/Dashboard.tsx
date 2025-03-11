
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UserPlus, 
  Stethoscope, 
  FileText, 
  CheckCheck 
} from "lucide-react";
import { usePatients } from "@/contexts/PatientContext";
import { PatientList } from "@/components/PatientList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const { patients, getPatientsByStatus } = usePatients();
  const [tab, setTab] = useState("all");

  const waitingPatients = getPatientsByStatus("waiting");
  const inTriagePatients = getPatientsByStatus("in-triage");
  const inConsultationPatients = getPatientsByStatus("in-consultation");
  const completedPatients = getPatientsByStatus("completed");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aguardando Atendimento
            </CardTitle>
            <UserPlus className="h-4 w-4 text-hospital-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waitingPatients.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Em Triagem
            </CardTitle>
            <Stethoscope className="h-4 w-4 text-hospital-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inTriagePatients.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Em Consulta
            </CardTitle>
            <FileText className="h-4 w-4 text-hospital-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inConsultationPatients.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Atendimentos Finalizados
            </CardTitle>
            <CheckCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPatients.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Lista de Pacientes</h2>
        <Tabs defaultValue="all" value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="waiting">Aguardando</TabsTrigger>
            <TabsTrigger value="in-triage">Em Triagem</TabsTrigger>
            <TabsTrigger value="in-consultation">Em Consulta</TabsTrigger>
            <TabsTrigger value="completed">Finalizados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <PatientList patients={patients} />
          </TabsContent>
          
          <TabsContent value="waiting">
            <PatientList patients={waitingPatients} />
          </TabsContent>
          
          <TabsContent value="in-triage">
            <PatientList patients={inTriagePatients} />
          </TabsContent>
          
          <TabsContent value="in-consultation">
            <PatientList patients={inConsultationPatients} />
          </TabsContent>
          
          <TabsContent value="completed">
            <PatientList patients={completedPatients} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
