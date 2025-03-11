
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
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  painLevel: number;
  mainComplaints: string;
  allergies: string;
  priorityLevel: 'low' | 'medium' | 'high' | 'emergency';
  notes: string;
  triageDate: string;
  triageBy: string;
}

export interface ConsultationData {
  patientId: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  prescription: string;
  exams: string;
  notes: string;
  followUp: string;
  consultationDate: string;
  doctorName: string;
}
