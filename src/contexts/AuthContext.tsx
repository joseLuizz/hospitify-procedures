
import React, { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  isAdmin: boolean;
}

const defaultContext: AuthContextType = {
  isAdmin: true, // Since we're removing authentication, everyone is an admin
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthContext.Provider value={defaultContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
