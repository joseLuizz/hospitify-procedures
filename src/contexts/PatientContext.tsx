
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Patient, TriageData, ConsultationData } from '@/types/patient';
import { useToast } from '@/hooks/use-toast';
import {
  getAllPatients,
  addPatient as addPatientToDb,
  updatePatientStatus as updatePatientStatusInDb,
  addTriageData as addTriageDataToDb,
  addConsultationData as addConsultationDataToDb,
  getTriageDataByPatientId as getTriageDataByPatientIdFromDb,
  getConsultationDataByPatientId as getConsultationDataByPatientIdFromDb,
  getPatientsByStatus as getPatientsByStatusFromDb
} from '@/lib/database';

interface PatientContextType {
  patients: Patient[];
  triageData: TriageData[];
  consultationData: ConsultationData[];
  addPatient: (patient: Omit<Patient, 'id' | 'registrationDate' | 'status'>) => void;
  updatePatientStatus: (id: string, status: Patient['status']) => void;
  addTriageData: (data: Omit<TriageData, 'triageDate'>) => void;
  // Update this line to accept Partial<ConsultationData> except for patientId
  addConsultationData: (data: Partial<Omit<ConsultationData, 'consultationDate'>> & { patientId: string }) => void;
  getPatientById: (id: string) => Patient | undefined;
  getTriageDataByPatientId: (id: string) => TriageData | undefined;
  getConsultationDataByPatientId: (id: string) => ConsultationData | undefined;
  getPatientsByStatus: (status: Patient['status']) => Patient[];
  loadingPatients: boolean;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [triageData, setTriageData] = useState<TriageData[]>([]);
  const [consultationData, setConsultationData] = useState<ConsultationData[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const { toast } = useToast();

  // Load all patients when component mounts
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoadingPatients(true);
        const { patients: fetchedPatients, error } = await getAllPatients();
        if (error) throw error;
        setPatients(fetchedPatients);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast({
          title: "Erro ao carregar pacientes",
          description: "Não foi possível carregar a lista de pacientes",
          variant: "destructive",
        });
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, [toast]);

  const addPatient = async (patientData: Omit<Patient, 'id' | 'registrationDate' | 'status'>) => {
    try {
      const { data, error } = await addPatientToDb(patientData);
      
      if (error) throw error;
      
      if (data) {
        // Add to local state
        setPatients(prevPatients => [...prevPatients, data as Patient]);
        
        toast({
          title: "Paciente registrado",
          description: `${patientData.name} foi registrado com sucesso.`,
        });
      }
    } catch (error: any) {
      console.error("Error adding patient:", error);
      toast({
        title: "Erro ao registrar paciente",
        description: error.message || "Não foi possível registrar o paciente",
        variant: "destructive",
      });
    }
  };

  const updatePatientStatus = async (id: string, status: Patient['status']) => {
    try {
      const { error } = await updatePatientStatusInDb(id, status);
      
      if (error) throw error;
      
      // Update local state
      setPatients(prevPatients => 
        prevPatients.map(patient => 
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
    } catch (error: any) {
      console.error("Error updating patient status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Não foi possível atualizar o status do paciente",
        variant: "destructive",
      });
    }
  };

  const addTriageData = async (data: Omit<TriageData, 'triageDate'>) => {
    try {
      const { data: newTriageData, error } = await addTriageDataToDb(data);
      
      if (error) throw error;
      
      if (newTriageData) {
        // Add to local state
        setTriageData(prevTriageData => [...prevTriageData, newTriageData as TriageData]);
        
        // Patient status is updated in the database function
        
        const patient = patients.find(p => p.id === data.patientId);
        if (patient) {
          // Update local patient status
          setPatients(prevPatients =>
            prevPatients.map(p =>
              p.id === data.patientId ? { ...p, status: 'in-consultation' } : p
            )
          );
          
          toast({
            title: "Triagem concluída",
            description: `Triagem de ${patient.name} registrada com sucesso.`,
          });
        }
      }
    } catch (error: any) {
      console.error("Error adding triage data:", error);
      toast({
        title: "Erro ao registrar triagem",
        description: error.message || "Não foi possível registrar a triagem",
        variant: "destructive",
      });
    }
  };

  const addConsultationData = async (data: Partial<Omit<ConsultationData, 'consultationDate'>> & { patientId: string }) => {
    try {
      const { data: newConsultationData, error } = await addConsultationDataToDb(data);
      
      if (error) throw error;
      
      if (newConsultationData) {
        // Add to local state
        setConsultationData(prevConsultationData => 
          [...prevConsultationData, newConsultationData as ConsultationData]
        );
        
        // Patient status is updated in the database function
        
        const patient = patients.find(p => p.id === data.patientId);
        if (patient) {
          // Update local patient status
          setPatients(prevPatients =>
            prevPatients.map(p =>
              p.id === data.patientId ? { ...p, status: 'completed' } : p
            )
          );
          
          toast({
            title: "Consulta finalizada",
            description: `Consulta de ${patient.name} registrada com sucesso.`,
          });
        }
      }
    } catch (error: any) {
      console.error("Error adding consultation data:", error);
      toast({
        title: "Erro ao registrar consulta",
        description: error.message || "Não foi possível registrar a consulta",
        variant: "destructive",
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
        loadingPatients
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
