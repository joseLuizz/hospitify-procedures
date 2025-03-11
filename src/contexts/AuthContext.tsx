
import { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define a simplified user profile type without Supabase dependencies
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

// Create a mock admin user for testing
const mockAdminUser: UserProfile = {
  id: '1',
  email: 'admin@teste.com',
  role: 'admin',
  name: 'Admin User',
  createdAt: new Date().toISOString(),
};

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Simple login function that sets the mock admin user
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock authentication - in a real app, you would validate against your database
      if (email === 'admin@teste.com' && password === 'password') {
        setUser(mockAdminUser);
        setProfile(mockAdminUser);
        setIsLoading(false);
        return { success: true };
      } else {
        throw new Error('Email ou senha inválidos');
      }
    } catch (error) {
      setIsLoading(false);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro de autenticação' 
      };
    }
  };

  // Simple logout function
  const logout = async () => {
    setUser(null);
    setProfile(null);
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
