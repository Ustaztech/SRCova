import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DatabaseService } from '../db/storage';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  refreshUser: () => void;
  demoUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'srcova_auth_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);

  const loadUsers = () => {
    const users = DatabaseService.getUsers().filter((u) => u.isActive);
    setDemoUsers(users);

    const savedUserId = localStorage.getItem(AUTH_USER_KEY);
    if (savedUserId) {
      const user = DatabaseService.getUserById(savedUserId);
      if (user && user.isActive) {
        setCurrentUser(user);
        return;
      }
    }
    // Do not force automatic login; user will authenticate or browse public landing page
  };

  useEffect(() => {
    loadUsers();

    // Listen for real-time data changes across tabs/components
    const handleDataChange = () => {
      loadUsers();
    };
    window.addEventListener('srcova:data_changed', handleDataChange);
    return () => window.removeEventListener('srcova:data_changed', handleDataChange);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    let user = DatabaseService.getUserByEmail(trimmedEmail);

    // Sole administrator guarantee for support.srcover@gmail.com
    if (trimmedEmail === 'support.srcover@gmail.com') {
      if (!user) {
        user = DatabaseService.createUser({
          email: 'support.srcover@gmail.com',
          passwordHash: password || 'Admin@SRCova2026',
          fullName: 'System Administrator',
          title: 'Lead System Administrator',
          role: 'SUPER_ADMIN',
          phone: '+234 800 000 0001',
          isActive: true,
        });
      } else if (user.role !== 'SUPER_ADMIN') {
        user = DatabaseService.updateUser(user.id, { role: 'SUPER_ADMIN', isActive: true });
      }
    }

    if (!user) {
      return { success: false, error: 'Account not found. Ensure you are using an authorized institutional email.' };
    }
    if (!user.isActive) {
      return { success: false, error: 'This staff account has been deactivated. Contact university ICT administrator.' };
    }
    if (user.passwordHash !== password) {
      return { success: false, error: 'Incorrect password for this institutional account.' };
    }

    const updated = DatabaseService.updateUser(user.id, {
      lastLogin: new Date().toISOString(),
    });

    setCurrentUser(updated);
    localStorage.setItem(AUTH_USER_KEY, updated.id);

    DatabaseService.logAction({
      userId: updated.id,
      userName: updated.fullName,
      userRole: updated.role,
      action: 'STAFF_LOGIN',
      entityType: 'Staff',
      entityId: updated.id,
      details: `Successful authenticated login to SRCova portal as ${updated.role}`,
    });

    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      DatabaseService.logAction({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'STAFF_LOGOUT',
        entityType: 'Staff',
        entityId: currentUser.id,
        details: 'Staff logged out of session',
      });
    }
    setCurrentUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const switchUser = (userId: string) => {
    const user = DatabaseService.getUserById(userId);
    if (user && user.isActive) {
      setCurrentUser(user);
      localStorage.setItem(AUTH_USER_KEY, user.id);
      DatabaseService.logAction({
        userId: user.id,
        userName: user.fullName,
        userRole: user.role,
        action: 'ROLE_SWITCH',
        entityType: 'Staff',
        entityId: user.id,
        details: `Switched active role to ${user.role} (${user.fullName})`,
      });
    }
  };

  const switchRole = (role: UserRole) => {
    const user = DatabaseService.getUsers().find((u) => u.role === role && u.isActive);
    if (user) {
      switchUser(user.id);
    }
  };

  const refreshUser = () => {
    if (currentUser) {
      const refreshed = DatabaseService.getUserById(currentUser.id);
      if (refreshed) {
        setCurrentUser(refreshed);
      }
    }
    setDemoUsers(DatabaseService.getUsers().filter((u) => u.isActive));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        switchUser,
        switchRole,
        refreshUser,
        demoUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
