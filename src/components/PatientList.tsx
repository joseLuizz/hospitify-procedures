
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
    <div className="grid grid-cols-1 xxs:grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {patients.map((patient) => (
        <div key={patient.id} className="h-full w-full">
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
