import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { DatabaseService } from '../db/storage';
import { hashPassword, isValidPassword, verifyPassword } from '../utils/passwordSecurity';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'srcova_auth_user_id';

const getAuthSnapshot = () => {
  const users = DatabaseService.getUsers();
  let currentUser: User | null = null;
  try {
    const savedUserId = localStorage.getItem(AUTH_USER_KEY);
    if (savedUserId) {
      const user = users.find((item) => item.id === savedUserId);
      if (user?.isActive) currentUser = user;
    }
  } catch {
    currentUser = null;
  }
  return { currentUser };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [{ currentUser }, setAuthSnapshot] = useState(getAuthSnapshot);
  const setCurrentUser = (user: User | null) =>
    setAuthSnapshot((snapshot) => ({ ...snapshot, currentUser: user }));
  const loadUsers = useCallback(() => setAuthSnapshot(getAuthSnapshot()), []);

  useEffect(() => {
    // Listen for real-time data changes across tabs/components
    const handleDataChange = () => {
      loadUsers();
    };
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'srcova_prod_v3_users' || event.key === AUTH_USER_KEY) {
        loadUsers();
      }
    };
    window.addEventListener('srcova:data_changed', handleDataChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('srcova:data_changed', handleDataChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadUsers]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const user = DatabaseService.getUserByEmail(trimmedEmail);
    if (!user) {
      return { success: false, error: 'Account not found. Ensure you are using an authorized institutional email.' };
    }
    if (!user.isActive) {
      return { success: false, error: 'This staff account has been deactivated. Contact university ICT administrator.' };
    }
    const passwordVerification = await verifyPassword(password, user.passwordHash);
    if (!passwordVerification.valid) {
      return { success: false, error: 'Incorrect password for this institutional account.' };
    }

    const mustChangePassword = user.mustChangePassword === true || passwordVerification.needsRehash;
    const passwordHash = passwordVerification.needsRehash
      ? await hashPassword(password)
      : user.passwordHash;
    const updated = DatabaseService.updateUser(user.id, {
      lastLogin: new Date().toISOString(),
      passwordHash,
      mustChangePassword,
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

    return { success: true, mustChangePassword };
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Sign in before changing your password.' };
    if (!isValidPassword(newPassword)) {
      return { success: false, error: 'Use a password between 12 and 128 characters.' };
    }

    try {
      const verification = await verifyPassword(currentPassword, currentUser.passwordHash);
      if (!verification.valid) {
        return { success: false, error: 'Your current password is incorrect.' };
      }

      const updated = DatabaseService.changeOwnPassword(
        currentUser.id,
        await hashPassword(newPassword),
        currentUser
      );
      setCurrentUser(updated);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unable to change your password.',
      };
    }
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

  const refreshUser = () => {
    if (!currentUser) return;
    const refreshed = DatabaseService.getUserById(currentUser.id);
    setCurrentUser(refreshed?.isActive ? refreshed : null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        changePassword,
        logout,
        refreshUser,
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
