
import { Patient } from "@/types/patient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  const age = patient.birthDate ? 
    Math.floor((new Date().getTime() - new Date(patient.birthDate).getTime()) / 31557600000) : 
    'N/A';

  return (
    <Card className="w-full h-full shadow-sm hover:shadow transition-shadow duration-200 flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3 pb-2">
        <CardTitle className="text-sm font-medium truncate max-w-[65%]">
          {patient.name}
        </CardTitle>
        <Badge className={`${statusColors[patient.status]} text-xs px-2 py-1`}>
          {statusLabels[patient.status]}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-3 pt-1">
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div>
            <p className="text-muted-foreground text-xxs">CPF:</p>
            <p className="truncate">{patient.cpf}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xxs">Idade:</p>
            <p>{age} anos</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xxs">Contato:</p>
            <p className="truncate">{patient.phone}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xxs">Plano:</p>
            <p className="truncate">{patient.healthInsurance || "Não possui"}</p>
          </div>
        </div>
        
        {actionText && onAction && (
          <div className="mt-auto">
            <Button 
              className="w-full bg-hospital-primary hover:bg-hospital-primary/90 text-xs py-1 h-8"
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
