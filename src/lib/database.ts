
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  setDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { db } from "./firebase";
import { Patient, TriageData, ConsultationData } from "@/types/patient";

// User management functions
export async function getAllUsers() {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const usersList = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      email: doc.data().email,
      role: doc.data().role,
      name: doc.data().name,
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
    }));
    
    return { users: usersList, error: null };
  } catch (error: any) {
    return { users: [], error: { message: error.message } };
  }
}

export async function signUp(email: string, password: string, role: string, name: string) {
  try {
    // Generate a random ID for the user
    const userId = Math.random().toString(36).substring(2, 15);
    
    // Store user data in Firestore
    await setDoc(doc(db, "users", userId), {
      email,
      role,
      name,
      createdAt: serverTimestamp()
    });
    
    return { 
      data: { 
        auth: { 
          user: {
            id: userId,
            email,
            role,
            name,
            createdAt: new Date().toISOString(),
          }
        }
      }, 
      error: null 
    };
  } catch (error: any) {
    return { 
      data: null, 
      error: { message: error.message } 
    };
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role });
    return { data: { success: true }, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
}

export async function deleteUser(userId: string) {
  try {
    await deleteDoc(doc(db, "users", userId));
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
}

// Patient management functions
export async function getAllPatients() {
  try {
    const patientsSnapshot = await getDocs(collection(db, "patients"));
    const patientsList = patientsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as Patient[];
    
    return { patients: patientsList, error: null };
  } catch (error: any) {
    return { patients: [], error: { message: error.message } };
  }
}

export async function addPatient(patientData: Omit<Patient, 'id' | 'registrationDate' | 'status'>) {
  try {
    const newPatient = {
      ...patientData,
      registrationDate: serverTimestamp(),
      status: 'waiting',
    };
    
    const docRef = await addDoc(collection(db, "patients"), newPatient);
    
    return { 
      data: { 
        id: docRef.id,
        ...newPatient,
        registrationDate: new Date().toISOString(),
      }, 
      error: null 
    };
  } catch (error: any) {
    return { 
      data: null, 
      error: { message: error.message } 
    };
  }
}

export async function updatePatientStatus(patientId: string, status: Patient['status']) {
  try {
    const patientRef = doc(db, "patients", patientId);
    await updateDoc(patientRef, { status });
    return { data: { success: true }, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
}

export async function getPatientsByStatus(status: Patient['status']) {
  try {
    const q = query(
      collection(db, "patients"),
      where("status", "==", status),
      orderBy("registrationDate", "desc")
    );
    
    const patientsSnapshot = await getDocs(q);
    const patientsList = patientsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as Patient[];
    
    return { patients: patientsList, error: null };
  } catch (error: any) {
    return { patients: [], error: { message: error.message } };
  }
}

// Triage functions
export async function addTriageData(data: Omit<TriageData, 'triageDate'>) {
  try {
    const newTriageData = {
      ...data,
      triageDate: serverTimestamp(),
    };
    
    await setDoc(doc(db, "triage", data.patientId), newTriageData);
    
    // Update patient status
    await updatePatientStatus(data.patientId, 'in-consultation');
    
    return { 
      data: { 
        ...newTriageData,
        triageDate: new Date().toISOString(),
      }, 
      error: null 
    };
  } catch (error: any) {
    return { 
      data: null, 
      error: { message: error.message } 
    };
  }
}

export async function getTriageDataByPatientId(patientId: string) {
  try {
    const triageDoc = await getDocs(query(
      collection(db, "triage"),
      where("patientId", "==", patientId)
    ));
    
    if (triageDoc.empty) {
      return { data: null, error: null };
    }
    
    const triageData = triageDoc.docs[0].data() as TriageData;
    
    return { 
      data: triageData, 
      error: null 
    };
  } catch (error: any) {
    return { 
      data: null, 
      error: { message: error.message } 
    };
  }
}

// Consultation functions
export async function addConsultationData(data: Partial<Omit<ConsultationData, 'consultationDate'>> & { patientId: string }) {
  try {
    // Provide defaults for all required fields
    const newConsultationData: Omit<ConsultationData, 'consultationDate'> = {
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
      symptoms: data.symptoms || '',
      diagnosis: data.diagnosis || '',
      treatment: data.treatment || '',
      exams: data.exams || '',
      notes: data.notes || '',
      followUp: data.followUp || '',
    };
    
    const consultationWithTimestamp = {
      ...newConsultationData,
      consultationDate: serverTimestamp(),
    };
    
    await setDoc(doc(db, "consultations", data.patientId), consultationWithTimestamp);
    
    // Update patient status
    await updatePatientStatus(data.patientId, 'completed');
    
    return { 
      data: { 
        ...newConsultationData,
        consultationDate: new Date().toISOString(),
      }, 
      error: null 
    };
  } catch (error: any) {
    return { 
      data: null, 
      error: { message: error.message } 
    };
  }
}

export async function getConsultationDataByPatientId(patientId: string) {
  try {
    const consultationDoc = await getDocs(query(
      collection(db, "consultations"),
      where("patientId", "==", patientId)
    ));
    
    if (consultationDoc.empty) {
      return { data: null, error: null };
    }
    
    const consultationData = consultationDoc.docs[0].data() as ConsultationData;
    
    return { 
      data: consultationData, 
      error: null 
    };
  } catch (error: any) {
    return { 
      data: null, 
      error: { message: error.message } 
    };
  }
}
