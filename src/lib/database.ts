
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
  orderBy,
  getDoc
} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "./firebase";
import { Patient, TriageData, ConsultationData } from "@/types/patient";

// Collections names
const COLLECTIONS = {
  USERS: "users",
  PATIENTS: "patients",
  TRIAGE: "triage",
  CONSULTATIONS: "consultations"
};

// User management functions
export async function getAllUsers() {
  try {
    const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    const usersList = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      email: doc.data().email,
      role: doc.data().role,
      name: doc.data().name,
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
    }));
    
    return { users: usersList, error: null };
  } catch (error: any) {
    console.error("Error getting users:", error);
    return { users: [], error: { message: error.message } };
  }
}

export async function signUp(email: string, password: string, role: string, name: string) {
  try {
    // Create user in Firebase Authentication without automatically signing in
    const auth = getAuth();
    
    // Get the current user before creating the new one
    const currentUser = auth.currentUser;
    
    // Create the new user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    
    // Store user data in Firestore with the UID from Firebase Auth
    await setDoc(doc(db, COLLECTIONS.USERS, userId), {
      email,
      role,
      name,
      createdAt: serverTimestamp()
    });
    
    // If there was a logged in user before, sign back in with that user
    if (currentUser) {
      // Force the auth state to refresh without requiring the user to sign in again
      await auth.updateCurrentUser(currentUser);
    }
    
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
    console.error("Error signing up:", error);
    return { 
      data: null, 
      error: { message: error.message } 
    };
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, { role });
    return { data: { success: true }, error: null };
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return { data: null, error: { message: error.message } };
  }
}

export async function deleteUser(userId: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
    return { error: null };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { error: { message: error.message } };
  }
}

// Patient management functions
export async function getAllPatients() {
  try {
    const patientsSnapshot = await getDocs(collection(db, COLLECTIONS.PATIENTS));
    const patientsList = patientsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        registrationDate: data.registrationDate?.toDate().toISOString() || new Date().toISOString()
      };
    }) as Patient[];
    
    return { patients: patientsList, error: null };
  } catch (error: any) {
    console.error("Error getting patients:", error);
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
    
    const docRef = await addDoc(collection(db, COLLECTIONS.PATIENTS), newPatient);
    
    return { 
      data: { 
        id: docRef.id,
        ...patientData,
        status: 'waiting',
        registrationDate: new Date().toISOString(),
      } as Patient, 
      error: null 
    };
  } catch (error: any) {
    console.error("Error adding patient:", error);
    return { 
      data: null, 
      error: { message: error.message } 
    };
  }
}

export async function updatePatientStatus(patientId: string, status: Patient['status']) {
  try {
    const patientRef = doc(db, COLLECTIONS.PATIENTS, patientId);
    await updateDoc(patientRef, { status });
    return { data: { success: true }, error: null };
  } catch (error: any) {
    console.error("Error updating patient status:", error);
    return { data: null, error: { message: error.message } };
  }
}

export async function getPatientsByStatus(status: Patient['status']) {
  try {
    const q = query(
      collection(db, COLLECTIONS.PATIENTS),
      where("status", "==", status),
      orderBy("registrationDate", "desc")
    );
    
    const patientsSnapshot = await getDocs(q);
    const patientsList = patientsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        registrationDate: data.registrationDate?.toDate().toISOString() || new Date().toISOString()
      };
    }) as Patient[];
    
    return { patients: patientsList, error: null };
  } catch (error: any) {
    console.error("Error getting patients by status:", error);
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
    
    await setDoc(doc(db, COLLECTIONS.TRIAGE, data.patientId), newTriageData);
    
    // Update patient status
    await updatePatientStatus(data.patientId, 'in-consultation');
    
    return { 
      data: { 
        ...newTriageData,
        triageDate: new Date().toISOString(),
      } as TriageData, 
      error: null 
    };
  } catch (error: any) {
    console.error("Error adding triage data:", error);
    return { 
      data: null, 
      error: { message: error.message } 
    };
  }
}

export async function getTriageDataByPatientId(patientId: string) {
  try {
    const triageRef = doc(db, COLLECTIONS.TRIAGE, patientId);
    const triageDoc = await getDoc(triageRef);
    
    if (!triageDoc.exists()) {
      return { data: null, error: null };
    }
    
    const data = triageDoc.data();
    const triageData = {
      ...data,
      triageDate: data.triageDate?.toDate().toISOString() || new Date().toISOString()
    } as TriageData;
    
    return { 
      data: triageData, 
      error: null 
    };
  } catch (error: any) {
    console.error("Error getting triage data:", error);
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
    
    await setDoc(doc(db, COLLECTIONS.CONSULTATIONS, data.patientId), consultationWithTimestamp);
    
    // Update patient status
    await updatePatientStatus(data.patientId, 'completed');
    
    return { 
      data: { 
        ...newConsultationData,
        consultationDate: new Date().toISOString(),
      } as ConsultationData, 
      error: null 
    };
  } catch (error: any) {
    console.error("Error adding consultation data:", error);
    return { 
      data: null, 
      error: { message: error.message } 
    };
  }
}

export async function getConsultationDataByPatientId(patientId: string) {
  try {
    const consultationRef = doc(db, COLLECTIONS.CONSULTATIONS, patientId);
    const consultationDoc = await getDoc(consultationRef);
    
    if (!consultationDoc.exists()) {
      return { data: null, error: null };
    }
    
    const data = consultationDoc.data();
    const consultationData = {
      ...data,
      consultationDate: data.consultationDate?.toDate().toISOString() || new Date().toISOString()
    } as ConsultationData;
    
    return { 
      data: consultationData, 
      error: null 
    };
  } catch (error: any) {
    console.error("Error getting consultation data:", error);
    return { 
      data: null, 
      error: { message: error.message } 
    };
  }
}
