
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from "@/components/ui/use-toast";

export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist';
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const defaultContext: AuthContextType = {
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
  isAdmin: false,
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Fetch additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<User, 'uid' | 'email'>;
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name,
              role: userData.role,
              photoURL: firebaseUser.photoURL || undefined
            });
          } else {
            // For testing purposes, create a user document if it doesn't exist
            // In production, you would typically handle this differently
            const defaultUserData = {
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              role: 'admin' as const,
              createdAt: serverTimestamp()
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), defaultUserData);
            
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: defaultUserData.name,
              role: defaultUserData.role,
              photoURL: firebaseUser.photoURL || undefined
            });
            
            toast({
              title: "Perfil criado automaticamente",
              description: "Um perfil foi criado para você automaticamente",
            });
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Error fetching user data");
          // Don't sign out automatically on error, just set the error
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [toast]);
  
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      // User will be set by the onAuthStateChanged listener
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login");
      setLoading(false);
    }
  };
  
  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const auth = getAuth();
      await firebaseSignOut(auth);
      // User will be set to null by the onAuthStateChanged listener
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err.message || "Failed to logout");
      setLoading(false);
    }
  };
  
  const isAdmin = user?.role === 'admin';
  
  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    isAdmin,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
