
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  setDoc 
} from "firebase/firestore";
import { db } from "./firebase";

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
