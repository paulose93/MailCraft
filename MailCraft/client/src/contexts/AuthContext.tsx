import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  status: 'REQUESTED' | 'UNDER_REVIEW' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED' | 'DELETED';
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ORG_OWNER' | 'ORG_MEMBER';
  organization: OrganizationData | null;
  organizations: {
    role: string;
    organization: OrganizationData;
  }[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('activeOrganizationId');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    if (data.user.organization) {
      localStorage.setItem('activeOrganizationId', data.user.organization.id);
    }
    setUser(data.user);
  };

  const register = async (registerData: RegisterData) => {
    const { data } = await api.post('/auth/register', registerData);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    if (data.user.organization) {
      localStorage.setItem('activeOrganizationId', data.user.organization.id);
    }
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('activeOrganizationId');
    setUser(null);
  };

  const switchOrganization = async (orgId: string) => {
    localStorage.setItem('activeOrganizationId', orgId);
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        fetchUser,
        switchOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
