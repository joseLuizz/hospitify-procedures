
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
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm sm:text-base md:text-lg font-medium truncate max-w-[70%]">
          {patient.name}
        </CardTitle>
        <Badge className={`${statusColors[patient.status]} whitespace-nowrap text-xs`}>
          {statusLabels[patient.status]}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm mb-4">
          <div>
            <p className="text-muted-foreground text-xs">CPF:</p>
            <p className="truncate">{patient.cpf}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Idade:</p>
            <p>{age} anos</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Contato:</p>
            <p className="truncate">{patient.phone}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Plano:</p>
            <p className="truncate">{patient.healthInsurance || "Não possui"}</p>
          </div>
        </div>
        
        {actionText && onAction && (
          <div className="mt-auto">
            <Button 
              className="w-full bg-hospital-primary hover:bg-hospital-primary/90 text-xs sm:text-sm py-1 px-2 h-auto sm:h-10"
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
