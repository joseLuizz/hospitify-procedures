
import { Patient } from "@/types/patient";
import { PatientCard } from "./PatientCard";

interface PatientListProps {
  patients: Patient[];
  actionText?: string;
  onAction?: (patient: Patient) => void;
  emptyMessage?: string;
}

export function PatientList({ patients, actionText, onAction, emptyMessage = "Não há pacientes para exibir" }: PatientListProps) {
  if (patients.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {patients.map((patient) => (
        <PatientCard 
          key={patient.id} 
          patient={patient} 
          actionText={actionText}
          onAction={onAction}
        />
      ))}
    </div>
  );
}
