
export interface MedicationData {
  id: string;
  patientId: string;
  administeringNurse: string;
  administeredAt: string;
  specialInstructions?: string;
}
