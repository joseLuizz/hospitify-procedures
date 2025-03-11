
export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  gender: 'M' | 'F' | 'O';
  cpf: string;
  phone: string;
  address: string;
  healthInsurance?: string;
  emergencyContact?: string;
  registrationDate: string;
  status: 'waiting' | 'in-triage' | 'in-consultation' | 'completed';
}

export interface TriageData {
  patientId: string;
  date: string;
  time: string;
  reclassified?: string;
  
  // 1. Queixa Principal/Motivo do Atendimento
  mainComplaints: string;
  
  // Alergias e Medicação
  allergies: string;
  regularMedication: string;
  
  // 2. Sinais Vitais
  bloodPressure: string;
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  temperature: number;
  glucose?: number;
  
  // 3. Escala de Coma de Glasgow
  ocularOpening: number;
  verbalResponse: number;
  motorResponse: number;
  glasgowTotal: number;
  
  // Reatividade pupilar
  pupilReactivity: 'inexistente' | 'unilateral' | 'bilateral';
  
  // 4. Escala de Dor
  painLevel: number;
  
  // Triagem
  priorityLevel: 'low' | 'medium' | 'high' | 'emergency';
  notes: string;
  triageBy: string;
  triageDate: string;
}

export interface ConsultationData {
  patientId: string;
  
  // Informações gerais
  allergies: string;
  hasAllergies: boolean;
  
  // Queixa e história
  mainComplaint: string;
  currentDiseaseHistory: string;
  
  // História progressa (comorbidades)
  hasHypertension: boolean;
  hasDiabetes: boolean;
  diabetesType?: string;
  hasDyslipidemia: boolean;
  hasSmoking: boolean;
  hasPregnancy: boolean;
  otherComorbidities: string;
  
  // Medicação de uso contínuo
  continuousMedication: string;
  
  // Exame físico
  generalState: 'BEG' | 'REG' | 'MEG';
  
  // Pele
  skin: {
    normal: boolean;
    pallor: boolean;
    jaundice: boolean;
    cyanosis: boolean;
    noChanges: boolean;
  };
  
  // Orofaringe
  oropharynx: {
    normal: boolean;
    altered: boolean;
    details?: string;
  };
  
  // Aparelho cardiovascular
  cardiovascular: {
    normalRhythm: boolean;
    altered: boolean;
    details?: string;
  };
  
  // Aparelho respiratório
  respiratory: {
    normal: boolean;
    altered: boolean;
    details?: string;
  };
  
  // Abdomen
  abdomen: {
    flat: boolean;
    globose: boolean;
    excavated: boolean;
    flaccid: boolean;
    tense: boolean;
    painful: boolean;
    details?: string;
  };
  
  // MMSS (Membros superiores)
  upperLimbs: {
    normal: boolean;
    altered: boolean;
    details?: string;
  };
  
  // MMII (Membros inferiores)
  lowerLimbs: {
    normal: boolean;
    altered: boolean;
    details?: string;
  };
  
  // Estado neurológico
  neurologicalState: {
    lucid: boolean;
    oriented: boolean;
    disoriented: boolean;
    drowsy: boolean;
    comatose: boolean;
  };
  
  // Sangramento ativo aparente
  activeBleedingVisible: boolean;
  
  // Glasgow
  glasgowScore: number;
  
  // Sinais vitais no formulário de consulta
  bloodPressure: string;
  heartRate: string;
  respiratoryRate: string;
  
  // CID
  cid: string;
  
  // Conduta
  conduct: {
    discharge: boolean;
    observation: boolean;
    hospitalization: boolean;
    medicaleave: boolean;
  };
  
  // Prescrição e assinaturas
  prescription: string;
  medicalTime: string;
  doctorName: string;
  nursingTechnician: string;
  consultationDate: string;
  
  // Campos adicionais do sistema original
  symptoms: string;
  diagnosis: string;
  treatment: string;
  exams: string;
  notes: string;
  followUp: string;
}
