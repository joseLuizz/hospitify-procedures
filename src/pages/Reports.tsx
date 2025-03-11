
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatients } from "@/contexts/PatientContext";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const Reports = () => {
  const { patients, triageData } = usePatients();
  
  // Estatísticas básicas
  const totalPatients = patients.length;
  const waitingPatients = patients.filter(p => p.status === 'waiting').length;
  const inTriagePatients = patients.filter(p => p.status === 'in-triage').length;
  const inConsultationPatients = patients.filter(p => p.status === 'in-consultation').length;
  const completedPatients = patients.filter(p => p.status === 'completed').length;
  
  // Dados para gráfico de status
  const statusData = [
    { name: 'Aguardando', value: waitingPatients, color: '#fbbc05' },
    { name: 'Em Triagem', value: inTriagePatients, color: '#1a73e8' },
    { name: 'Em Consulta', value: inConsultationPatients, color: '#34a853' },
    { name: 'Finalizados', value: completedPatients, color: '#9aa0a6' },
  ];
  
  // Dados para gráfico de prioridade
  const emergencyCount = triageData.filter(t => t.priorityLevel === 'emergency').length;
  const highCount = triageData.filter(t => t.priorityLevel === 'high').length;
  const mediumCount = triageData.filter(t => t.priorityLevel === 'medium').length;
  const lowCount = triageData.filter(t => t.priorityLevel === 'low').length;
  
  const priorityData = [
    { name: 'Emergência', value: emergencyCount, color: '#ea4335' },
    { name: 'Alta', value: highCount, color: '#fbbc05' },
    { name: 'Média', value: mediumCount, color: '#1a73e8' },
    { name: 'Baixa', value: lowCount, color: '#34a853' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aguardando Atendimento
            </CardTitle>
            <div className="h-4 w-4 rounded-full bg-hospital-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waitingPatients}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Em Processamento
            </CardTitle>
            <div className="h-4 w-4 rounded-full bg-hospital-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inTriagePatients + inConsultationPatients}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Atendimentos Finalizados
            </CardTitle>
            <div className="h-4 w-4 rounded-full bg-hospital-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPatients}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Status dos Pacientes</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Níveis de Prioridade</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  width={500}
                  height={300}
                  data={priorityData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Quantidade">
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
