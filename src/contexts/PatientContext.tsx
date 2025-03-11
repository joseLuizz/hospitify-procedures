
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
  // Update this line to accept Partial<ConsultationData> except for patientId
  addConsultationData: (data: Partial<Omit<ConsultationData, 'consultationDate'>> & { patientId: string }) => void;
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

  const addConsultationData = (data: Partial<Omit<ConsultationData, 'consultationDate'>> & { patientId: string }) => {
    // Provide default values for all required fields
    const newConsultationData: ConsultationData = {
      patientId: data.patientId,
      allergies: data.allergies || '',
      hasAllergies: data.hasAllergies || false,
      mainComplaint: data.mainComplaint || data.symptoms || '',
      currentDiseaseHistory: data.currentDiseaseHistory || '',
      hasHypertension: data.hasHypertension || false,
      hasDiabetes: data.hasDiabetes || false,
      hasDyslipidemia: data.hasDyslipidemia || false,
      hasSmoking: data.hasSmoking || false,
      hasPregnancy: data.hasPregnancy || false,
      otherComorbidities: data.otherComorbidities || '',
      continuousMedication: data.continuousMedication || '',
      generalState: data.generalState || 'BEG',
      skin: data.skin || {
        normal: true,
        pallor: false,
        jaundice: false,
        cyanosis: false,
        noChanges: false,
      },
      oropharynx: data.oropharynx || {
        normal: true,
        altered: false,
      },
      cardiovascular: data.cardiovascular || {
        normalRhythm: true,
        altered: false,
      },
      respiratory: data.respiratory || {
        normal: true,
        altered: false,
      },
      abdomen: data.abdomen || {
        flat: true,
        globose: false,
        excavated: false,
        flaccid: false,
        tense: false,
        painful: false,
      },
      upperLimbs: data.upperLimbs || {
        normal: true,
        altered: false,
      },
      lowerLimbs: data.lowerLimbs || {
        normal: true,
        altered: false,
      },
      neurologicalState: data.neurologicalState || {
        lucid: true,
        oriented: true,
        disoriented: false,
        drowsy: false,
        comatose: false,
      },
      activeBleedingVisible: data.activeBleedingVisible || false,
      glasgowScore: data.glasgowScore || 15,
      bloodPressure: data.bloodPressure || '',
      heartRate: data.heartRate || '',
      respiratoryRate: data.respiratoryRate || '',
      cid: data.cid || '',
      conduct: data.conduct || {
        discharge: true,
        observation: false,
        hospitalization: false,
        medicaleave: false,
      },
      prescription: data.prescription || '',
      medicalTime: data.medicalTime || new Date().toLocaleTimeString(),
      doctorName: data.doctorName || '',
      nursingTechnician: data.nursingTechnician || '',
      consultationDate: new Date().toISOString(),
      symptoms: data.symptoms || '',
      diagnosis: data.diagnosis || '',
      treatment: data.treatment || '',
      exams: data.exams || '',
      notes: data.notes || '',
      followUp: data.followUp || '',
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
