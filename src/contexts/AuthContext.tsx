
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserProfile, getCurrentUser, getUserProfile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  checkIsAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  isAuthenticated: false,
  checkIsAdmin: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadUserData() {
      try {
        // Get session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          setUser(session.user);
          
          // Get user profile
          const { profile, error } = await getUserProfile(session.user.id);
          if (error) {
            throw error;
          }
          
          setProfile(profile);
          setIsAdmin(profile.role === 'admin');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: "Erro ao carregar dados do usuário",
          description: "Por favor, tente novamente mais tarde",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserData();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      
      if (newSession?.user) {
        const { profile } = await getUserProfile(newSession.user.id);
        setProfile(profile);
        setIsAdmin(profile?.role === 'admin');
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const checkIsAdmin = () => {
    return profile?.role === 'admin';
  };

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        user, 
        profile,
        isLoading,
        isAdmin,
        isAuthenticated: !!user,
        checkIsAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
