
import { Patient } from "@/types/patient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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

interface PatientCardProps {
  patient: Patient;
  actionText?: string;
  onAction?: (patient: Patient) => void;
}

export function PatientCard({ patient, actionText, onAction }: PatientCardProps) {
  const navigate = useNavigate();

  const age = patient.birthDate ? 
    Math.floor((new Date().getTime() - new Date(patient.birthDate).getTime()) / 31557600000) : 
    'N/A';

  return (
    <Card className="w-full h-full shadow-sm hover:shadow transition-shadow duration-200 flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium truncate">{patient.name}</CardTitle>
        <Badge className={`${statusColors[patient.status]} whitespace-nowrap`}>
          {statusLabels[patient.status]}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="overflow-hidden">
            <p className="text-muted-foreground text-xs">CPF:</p>
            <p className="truncate">{patient.cpf}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Idade:</p>
            <p>{age} anos</p>
          </div>
          <div className="overflow-hidden">
            <p className="text-muted-foreground text-xs">Contato:</p>
            <p className="truncate">{patient.phone}</p>
          </div>
          <div className="overflow-hidden">
            <p className="text-muted-foreground text-xs">Plano:</p>
            <p className="truncate">{patient.healthInsurance || "Não possui"}</p>
          </div>
        </div>
        
        {actionText && onAction && (
          <div className="mt-auto">
            <Button 
              className="w-full bg-hospital-primary hover:bg-hospital-primary/90"
              onClick={() => onAction(patient)}
            >
              {actionText}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
