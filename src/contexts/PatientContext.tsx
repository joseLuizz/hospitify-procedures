
import { createContext, useContext, useState, ReactNode } from 'react';
import { Patient, TriageData, ConsultationData } from '@/types/patient';
import { useToast } from '@/hooks/use-toast';

// Dados de exemplo para iniciar o sistema com alguns pacientes
const initialPatients: Patient[] = [
  {
    id: '1',
    name: 'João Silva',
    birthDate: '1980-05-15',
    gender: 'M',
    cpf: '123.456.789-00',
    phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123',
    healthInsurance: 'Amil',
    emergencyContact: '(11) 91234-5678',
    registrationDate: new Date().toISOString(),
    status: 'waiting',
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    birthDate: '1990-10-20',
    gender: 'F',
    cpf: '987.654.321-00',
    phone: '(11) 91234-5678',
    address: 'Av. Paulista, 1000',
    healthInsurance: 'Unimed',
    emergencyContact: '(11) 98765-4321',
    registrationDate: new Date().toISOString(),
    status: 'in-triage',
  },
];

interface PatientContextType {
  patients: Patient[];
  triageData: TriageData[];
  consultationData: ConsultationData[];
  addPatient: (patient: Omit<Patient, 'id' | 'registrationDate' | 'status'>) => void;
  updatePatientStatus: (id: string, status: Patient['status']) => void;
  addTriageData: (data: Omit<TriageData, 'triageDate'>) => void;
  addConsultationData: (data: Omit<ConsultationData, 'consultationDate'>) => void;
  getPatientById: (id: string) => Patient | undefined;
  getTriageDataByPatientId: (id: string) => TriageData | undefined;
  getConsultationDataByPatientId: (id: string) => ConsultationData | undefined;
  getPatientsByStatus: (status: Patient['status']) => Patient[];
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [triageData, setTriageData] = useState<TriageData[]>([]);
  const [consultationData, setConsultationData] = useState<ConsultationData[]>([]);
  const { toast } = useToast();

  const addPatient = (patientData: Omit<Patient, 'id' | 'registrationDate' | 'status'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: Date.now().toString(),
      registrationDate: new Date().toISOString(),
      status: 'waiting',
    };
    
    setPatients([...patients, newPatient]);
    toast({
      title: "Paciente registrado",
      description: `${newPatient.name} foi registrado com sucesso.`,
    });
  };

  const updatePatientStatus = (id: string, status: Patient['status']) => {
    setPatients(
      patients.map((patient) =>
        patient.id === id ? { ...patient, status } : patient
      )
    );
    
    const patient = patients.find(p => p.id === id);
    if (patient) {
      toast({
        title: "Status atualizado",
        description: `Status de ${patient.name} alterado para ${status}.`,
      });
    }
  };

  const addTriageData = (data: Omit<TriageData, 'triageDate'>) => {
    const newTriageData: TriageData = {
      ...data,
      triageDate: new Date().toISOString(),
    };
    
    setTriageData([...triageData, newTriageData]);
    updatePatientStatus(data.patientId, 'in-consultation');
    
    const patient = patients.find(p => p.id === data.patientId);
    if (patient) {
      toast({
        title: "Triagem concluída",
        description: `Triagem de ${patient.name} registrada com sucesso.`,
      });
    }
  };

  const addConsultationData = (data: Omit<ConsultationData, 'consultationDate'>) => {
    const newConsultationData: ConsultationData = {
      ...data,
      consultationDate: new Date().toISOString(),
    };
    
    setConsultationData([...consultationData, newConsultationData]);
    updatePatientStatus(data.patientId, 'completed');
    
    const patient = patients.find(p => p.id === data.patientId);
    if (patient) {
      toast({
        title: "Consulta finalizada",
        description: `Consulta de ${patient.name} registrada com sucesso.`,
      });
    }
  };

  const getPatientById = (id: string) => {
    return patients.find((patient) => patient.id === id);
  };

  const getTriageDataByPatientId = (id: string) => {
    return triageData.find((data) => data.patientId === id);
  };

  const getConsultationDataByPatientId = (id: string) => {
    return consultationData.find((data) => data.patientId === id);
  };

  const getPatientsByStatus = (status: Patient['status']) => {
    return patients.filter((patient) => patient.status === status);
  };

  return (
    <PatientContext.Provider
      value={{
        patients,
        triageData,
        consultationData,
        addPatient,
        updatePatientStatus,
        addTriageData,
        addConsultationData,
        getPatientById,
        getTriageDataByPatientId,
        getConsultationDataByPatientId,
        getPatientsByStatus,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};
