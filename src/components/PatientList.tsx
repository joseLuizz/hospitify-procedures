
import { Patient } from "@/types/patient";
import { PatientCard } from "./PatientCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface PatientListProps {
  patients: Patient[];
  actionText?: string;
  onAction?: (patient: Patient) => void;
  emptyMessage?: string;
}

export function PatientList({ patients, actionText, onAction, emptyMessage = "Não há pacientes para exibir" }: PatientListProps) {
  const isMobile = useIsMobile();
  
  if (patients.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      {patients.map((patient) => (
        <div key={patient.id}>
          <PatientCard 
            patient={patient} 
            actionText={actionText}
            onAction={onAction}
          />
        </div>
      ))}
    </div>
  );
}
