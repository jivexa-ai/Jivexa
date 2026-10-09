import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  nodeAuthLogin, 
  nodeAuthSignup, 
  nodeAuthLogout, 
  nodeAuthGetMe, 
  nodeAuthSendOTP, 
  nodeAuthVerifyOTP,
  nodeAuthSubmitVerification,
  nodeAuthResendVerification,
  nodeAuthUploadProfilePhoto,
  nodeAuthRemoveProfilePhoto
} from '../services/nodeAuthService';

export type UserRole = 'PATIENT' | 'DOCTOR' | 'PHARMACY' | 'ADMIN' | 'AMBULANCE_PARTNER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  verified: boolean;
  emailVerified?: boolean;
  accountStatus?: string;
  onboarded: boolean;
  phone?: string;
  dob?: string;
  professionalDetails?: any;
  vehicleDetails?: any;
  licenseDetails?: any;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
  requireOtp?: boolean;
  requireEmailConfirmation?: boolean;
  email?: string;
  maskedEmail?: string;
  role?: UserRole;
  message?: string;
  previewUrl?: string;
  accountStatus?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<AuthActionResult>;
  signup: (email: string, name: string, role: UserRole, password?: string, extraFields?: Record<string, any>) => Promise<AuthActionResult>;
  verifyEmail: (code: string, email?: string) => Promise<AuthActionResult>;
  sendOTP: (email?: string) => Promise<AuthActionResult>;
  resendVerificationEmail: (email?: string) => Promise<AuthActionResult>;
  submitRoleVerification: (payload: Record<string, any>) => Promise<AuthActionResult>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateOnboarding: (data: Partial<User>) => Promise<{ success: boolean }>;
  uploadProfilePhoto: (file: File) => Promise<{ success: boolean; avatarUrl?: string; error?: string }>;
  removeProfilePhoto: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitializingRef = useRef(false);

  useEffect(() => {
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;

    const initializeAuth = async () => {
      // 1. Check Node.js / Express Cookie Session & Token
      try {
        const nodeRes = await nodeAuthGetMe();
        if (nodeRes.success && nodeRes.user) {
          const userProfile: User = {
            id: nodeRes.user.id || `node_${Date.now()}`,
            email: nodeRes.user.email,
            name: nodeRes.user.name,
            role: nodeRes.user.role || 'PATIENT',
            verified: Boolean(nodeRes.user.emailVerified || nodeRes.user.verified),
            emailVerified: Boolean(nodeRes.user.emailVerified),
            accountStatus: nodeRes.user.accountStatus || 'ACTIVE',
            onboarded: true,
            professionalDetails: nodeRes.user.professionalDetails,
            vehicleDetails: nodeRes.user.vehicleDetails,
            licenseDetails: nodeRes.user.licenseDetails,
            avatarUrl: nodeRes.user.avatarUrl || (nodeRes.user as any).professionalDetails?.avatarUrl || (nodeRes.user as any).usage?.avatarUrl || '',
            createdAt: nodeRes.user.createdAt || (nodeRes.user as any).created_at,
            updatedAt: nodeRes.user.updatedAt || (nodeRes.user as any).updated_at
          };
          setUser(userProfile);
          localStorage.setItem('jivexa_session_user', JSON.stringify(userProfile));
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn('[Auth Context] Node session lookup skipped');
      }

      // Check stored session user if available
      const savedUser = localStorage.getItem('jivexa_session_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setIsLoading(false);
          return;
        } catch (e) {}
      }

      // If backend session lookup fails/is unauthenticated, clear local session storage and tokens
      setUser(null);
      localStorage.removeItem('jivexa_session_user');
      localStorage.removeItem('jivexa_node_jwt_token');
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // LOGIN IMPLEMENTATION (BACKEND ONLY)
  const login = async (email: string, password: string, role?: UserRole): Promise<AuthActionResult> => {
    setIsLoading(true);
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedPassword = password.trim();

    if (!sanitizedEmail) {
      setIsLoading(false);
      return { success: false, error: 'Please enter your email address.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      setIsLoading(false);
      return { success: false, error: 'Please enter a valid email address (e.g. user@domain.com).' };
    }

    if (!sanitizedPassword) {
      setIsLoading(false);
      return { success: false, error: 'Please enter your password.' };
    }

    try {
      const nodeRes = await nodeAuthLogin(sanitizedEmail, sanitizedPassword, role);
      if (nodeRes.success && nodeRes.user) {
        const userProfile: User = {
          id: nodeRes.user.id || `node_${Date.now()}`,
          email: nodeRes.user.email,
          name: nodeRes.user.name,
          role: (nodeRes.user.role || role || 'PATIENT') as UserRole,
          verified: true,
          emailVerified: true,
          accountStatus: nodeRes.user.accountStatus || 'ACTIVE',
          onboarded: true,
          professionalDetails: nodeRes.user.professionalDetails,
          vehicleDetails: nodeRes.user.vehicleDetails,
          licenseDetails: nodeRes.user.licenseDetails,
          avatarUrl: nodeRes.user.avatarUrl || (nodeRes.user as any).professionalDetails?.avatarUrl || (nodeRes.user as any).usage?.avatarUrl || '',
          createdAt: nodeRes.user.createdAt || (nodeRes.user as any).created_at,
          updatedAt: nodeRes.user.updatedAt || (nodeRes.user as any).updated_at
        };
        setUser(userProfile);
        localStorage.setItem('jivexa_session_user', JSON.stringify(userProfile));
        setIsLoading(false);
        return { success: true, role: userProfile.role };
      } else {
        setIsLoading(false);
        return { 
          success: false, 
          error: nodeRes.error || 'Invalid credentials or login failed.',
          requireEmailConfirmation: nodeRes.requireEmailConfirmation || nodeRes.requireOtp,
          requireOtp: nodeRes.requireOtp,
          email: nodeRes.email || sanitizedEmail,
          maskedEmail: nodeRes.maskedEmail
        };
      }
    } catch (e: any) {
      setIsLoading(false);
      return {
        success: false,
        error: e.message || 'Authentication service is unavailable.'
      };
    }
  };

  // SIGNUP IMPLEMENTATION (BACKEND ONLY)
  const signup = async (
    email: string, 
    name: string, 
    role: UserRole, 
    password?: string,
    extraFields?: Record<string, any>
  ): Promise<AuthActionResult> => {
    setIsLoading(true);
    let sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim();
    const sanitizedPassword = (password || '').trim();

    if (!sanitizedName) {
      setIsLoading(false);
      return { success: false, error: 'Full name is required.' };
    }
    if (sanitizedName.length < 3) {
      setIsLoading(false);
      return { success: false, error: 'Name must be at least 3 characters long.' };
    }

    if (!sanitizedEmail) {
      setIsLoading(false);
      return { success: false, error: 'Please enter an email address.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (sanitizedEmail.includes('@') && !emailRegex.test(sanitizedEmail)) {
      setIsLoading(false);
      return { success: false, error: 'Invalid email address format (e.g. user@domain.com).' };
    }
    if (!sanitizedEmail.includes('@')) {
      sanitizedEmail = `${sanitizedEmail}@jivexa.com`;
    }

    if (!sanitizedPassword) {
      setIsLoading(false);
      return { success: false, error: 'Please choose a password.' };
    }
    if (sanitizedPassword.length < 8) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }
    if (!/[A-Z]/.test(sanitizedPassword)) {
      setIsLoading(false);
      return { success: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
    }
    if (!/[a-z]/.test(sanitizedPassword)) {
      setIsLoading(false);
      return { success: false, error: 'Password must contain at least one lowercase letter (a-z).' };
    }
    if (!/[0-9]/.test(sanitizedPassword)) {
      setIsLoading(false);
      return { success: false, error: 'Password must contain at least one number (0-9).' };
    }
    if (!/[^A-Za-z0-9]/.test(sanitizedPassword)) {
      setIsLoading(false);
      return { success: false, error: 'Password must contain at least one special symbol (@!#$ etc.).' };
    }

    try {
      const nodeRes = await nodeAuthSignup(sanitizedName, sanitizedEmail, sanitizedPassword, role, extraFields);
      if (nodeRes.success) {
        if (nodeRes.user) {
          const userProfile: User = {
            id: nodeRes.user.id || `usr_${Date.now()}`,
            email: nodeRes.user.email || sanitizedEmail,
            name: nodeRes.user.name || sanitizedName,
            role: (nodeRes.user.role || role) as UserRole,
            verified: Boolean(nodeRes.user.verified ?? true),
            emailVerified: Boolean(nodeRes.user.emailVerified ?? true),
            accountStatus: nodeRes.user.accountStatus || 'ACTIVE',
            onboarded: true,
            professionalDetails: nodeRes.user.professionalDetails || (extraFields?.nmcRegistrationNumber ? { nmcRegistrationNumber: extraFields.nmcRegistrationNumber, stateMedicalCouncil: extraFields.stateMedicalCouncil } : undefined),
            vehicleDetails: nodeRes.user.vehicleDetails || (extraFields?.vehicleNumber ? { vehicleNumber: extraFields.vehicleNumber } : undefined),
            licenseDetails: nodeRes.user.licenseDetails || (extraFields?.drugLicenseNumber ? { drugLicenseNumber: extraFields.drugLicenseNumber, gstin: extraFields.gstin } : undefined),
            avatarUrl: nodeRes.user.avatarUrl || '',
            createdAt: nodeRes.user.createdAt || (nodeRes.user as any).created_at || new Date().toISOString(),
            updatedAt: nodeRes.user.updatedAt || (nodeRes.user as any).updated_at || new Date().toISOString()
          };

          setUser(userProfile);
          localStorage.setItem('jivexa_session_user', JSON.stringify(userProfile));
          setIsLoading(false);
          return { 
            success: true, 
            role: userProfile.role,
            requireEmailConfirmation: false,
            requireOtp: false,
            message: nodeRes.message
          };
        } else {
          setIsLoading(false);
          return {
            success: true,
            role,
            requireEmailConfirmation: false,
            requireOtp: false,
            message: nodeRes.message
          };
        }
      } else {
        setIsLoading(false);
        return { 
          success: false, 
          error: nodeRes.error || 'Registration failed.',
          requireEmailConfirmation: false,
          requireOtp: false
        };
      }
    } catch (e: any) {
      setIsLoading(false);
      return {
        success: false,
        error: e.message || 'Authentication service is unavailable.'
      };
    }
  };

  const verifyEmail = async (code: string, emailTarget?: string): Promise<AuthActionResult> => {
    setIsLoading(true);

    try {
      const targetEmail = emailTarget || user?.email || '';
      const nodeRes = await nodeAuthVerifyOTP(targetEmail, code);
      if (nodeRes.success && nodeRes.user) {
        const userProfile: User = {
          id: nodeRes.user.id || `node_${Date.now()}`,
          email: nodeRes.user.email,
          name: nodeRes.user.name,
          role: nodeRes.user.role || 'PATIENT',
          verified: true,
          emailVerified: true,
          accountStatus: nodeRes.user.accountStatus || 'ACTIVE',
          onboarded: true,
          professionalDetails: nodeRes.user.professionalDetails,
          vehicleDetails: nodeRes.user.vehicleDetails,
          licenseDetails: nodeRes.user.licenseDetails
        };
        setUser(userProfile);
        localStorage.setItem('jivexa_session_user', JSON.stringify(userProfile));
        setIsLoading(false);
        return { success: true, role: userProfile.role, message: nodeRes.message };
      } else {
        setIsLoading(false);
        return { success: false, error: nodeRes.error || 'Invalid 6-digit OTP code.' };
      }
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'OTP verification failed.' };
    }
  };

  const sendOTP = async (emailTarget?: string): Promise<AuthActionResult> => {
    const targetEmail = emailTarget || user?.email || '';
    if (!targetEmail || !targetEmail.includes('@') || !targetEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid, complete email address (e.g. user@domain.com)' };
    }

    try {
      const nodeRes = await nodeAuthSendOTP(targetEmail);
      if (nodeRes.success) {
        return { success: true, message: nodeRes.message, maskedEmail: nodeRes.maskedEmail, previewUrl: nodeRes.previewUrl };
      } else {
        return { success: false, error: nodeRes.error || 'Failed to dispatch OTP email.' };
      }
    } catch (e: any) {
      return { success: false, error: 'Could not send OTP email. Please try again.' };
    }
  };

  const resendVerificationEmail = async (emailTarget?: string): Promise<AuthActionResult> => {
    const targetEmail = (emailTarget || user?.email || '').trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@') || !targetEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid email address (e.g. user@domain.com)' };
    }

    try {
      const nodeRes = await nodeAuthResendVerification(targetEmail);
      if (nodeRes.success) {
        return { 
          success: true, 
          message: nodeRes.message || 'Verification email resent successfully.', 
          maskedEmail: nodeRes.maskedEmail 
        };
      }
      return { success: false, error: nodeRes.error || 'Failed to resend verification email.' };
    } catch (e: any) {
      return { success: false, error: 'Could not send verification email. Please try again.' };
    }
  };

  const submitRoleVerification = async (payload: Record<string, any>): Promise<AuthActionResult> => {
    try {
      const nodeRes = await nodeAuthSubmitVerification(payload);
      if (!nodeRes.success) {
        return { success: false, error: nodeRes.error || 'Verification submission failed.' };
      }
      if (user) {
        const updated: User = {
          ...user,
          accountStatus: nodeRes.accountStatus || 'PENDING_REVIEW',
          professionalDetails: payload.nmcRegistrationNumber ? { nmcRegistrationNumber: payload.nmcRegistrationNumber, stateMedicalCouncil: payload.stateMedicalCouncil } : user.professionalDetails,
          vehicleDetails: payload.vehicleNumber ? { vehicleNumber: payload.vehicleNumber } : user.vehicleDetails,
          licenseDetails: payload.drugLicenseNumber ? { drugLicenseNumber: payload.drugLicenseNumber, gstin: payload.gstin } : user.licenseDetails
        };
        setUser(updated);
        localStorage.setItem('jivexa_session_user', JSON.stringify(updated));
      }
      return { success: true, message: nodeRes.message || 'Verification submitted.', accountStatus: nodeRes.accountStatus || 'PENDING_REVIEW' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to submit verification details.' };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const sanitizedEmail = email.toLowerCase().trim();
    if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    try {
      const sendRes = await sendOTP(sanitizedEmail);
      if (sendRes.success) {
        return { success: true };
      }
      return { success: false, error: sendRes.error || 'Password reset request failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset request failed.' };
    }
  };

  const updateOnboarding = async (data: Partial<User>): Promise<{ success: boolean }> => {
    if (!user) return { success: false };

    const updatedUser = { ...user, ...data, onboarded: true, updatedAt: new Date().toISOString() };
    setUser(updatedUser);
    localStorage.setItem('jivexa_session_user', JSON.stringify(updatedUser));
    return { success: true };
  };

  const uploadProfilePhoto = async (file: File): Promise<{ success: boolean; avatarUrl?: string; error?: string }> => {
    try {
      const res = await nodeAuthUploadProfilePhoto(file);
      if (res.success && res.avatarUrl) {
        if (user) {
          const updated = { ...user, avatarUrl: res.avatarUrl };
          setUser(updated);
          localStorage.setItem('jivexa_session_user', JSON.stringify(updated));
        }
        return { success: true, avatarUrl: res.avatarUrl };
      }
      return { success: false, error: res.error || 'Failed to upload photo' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error uploading profile photo' };
    }
  };

  const removeProfilePhoto = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await nodeAuthRemoveProfilePhoto();
      if (res.success) {
        if (user) {
          const updated = { ...user, avatarUrl: '' };
          setUser(updated);
          localStorage.setItem('jivexa_session_user', JSON.stringify(updated));
        }
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to remove photo' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error removing profile photo' };
    }
  };

  const logout = () => {
    nodeAuthLogout();
    setUser(null);
    localStorage.removeItem('jivexa_session_user');
    localStorage.removeItem('jivexa_node_jwt_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        verifyEmail,
        sendOTP,
        resendVerificationEmail,
        submitRoleVerification,
        resetPassword,
        updateOnboarding,
        uploadProfilePhoto,
        removeProfilePhoto,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
