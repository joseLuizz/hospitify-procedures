
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  User as FirebaseUser
} from "firebase/auth";
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp, 
  getDoc, 
  setDoc
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserProfile } from '@/contexts/AuthContext';

// Authentication functions
export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Fetch user profile data from Firestore
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    const userData = userDoc.data();
    
    if (!userData) {
      return { data: null, error: { message: "User profile not found" } };
    }
    
    return { 
      data: { 
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          role: userData.role,
          name: userData.name,
          createdAt: userData.createdAt?.toDate().toISOString() || new Date().toISOString(),
        }
      }, 
      error: null 
    };
  } catch (error: any) {
    return { 
      data: null, 
      error: { message: error.message || 'Invalid email or password' } 
    };
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message } };
  }
}

export async function signUp(email: string, password: string, role: string, name: string) {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store additional user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      role,
      name,
      createdAt: serverTimestamp()
    });
    
    return { 
      data: { 
        auth: { 
          user: {
            id: user.uid,
            email,
            role,
            name,
            createdAt: new Date().toISOString(),
          }
        }, 
        profile: null 
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
