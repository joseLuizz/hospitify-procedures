
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { signIn, signOut } from '@/lib/database';

// Define a user profile type
export interface UserProfile {
  id: string;
  email: string;
  role: 'tec enfermagem' | 'enfermeiro' | 'medico' | 'admin';
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  checkIsAdmin: () => boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  isAuthenticated: false,
  checkIsAdmin: () => false,
  login: async () => ({ success: false }),
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.data();
          
          if (userData) {
            const userProfile: UserProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: userData.role as UserProfile['role'],
              name: userData.name,
              createdAt: userData.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
            };
            
            setUser(userProfile);
            setProfile(userProfile);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      
      setIsLoading(false);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.user) {
        setUser(data.user);
        setProfile(data.user);
        setIsLoading(false);
        return { success: true };
      } else {
        throw new Error('Failed to login');
      }
    } catch (error) {
      setIsLoading(false);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro de autenticação' 
      };
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Erro ao sair",
        description: "Não foi possível realizar o logout",
        variant: "destructive",
      });
    }
  };

  const checkIsAdmin = () => {
    return profile?.role === 'admin';
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile,
        isLoading,
        isAdmin: profile?.role === 'admin' || false,
        isAuthenticated: !!user,
        checkIsAdmin,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
