// Extended User Model with Health Metrics
export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  bloodType?: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
  height?: number; // in cm
  weight?: number; // in kg
  allergies: string[];
  chronicConditions: string[];
  currentMedications: Medication[];
  emergencyContacts: EmergencyContact[];
  insuranceInfo?: InsuranceInfo;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  reason: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  effectiveDate: Date;
  expirationDate: Date;
}

export interface UserPreferences {
  language: string; // 'en', 'es', 'fr', etc.
  timezone: string;
  notificationPreferences: NotificationPreferences;
  theme: 'light' | 'dark' | 'system';
  twoFactorEnabled: boolean;
  twoFactorMethod: '2fa-totp' | '2fa-sms' | 'none';
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  medicationReminders: boolean;
  appointmentReminders: boolean;
  healthTips: boolean;
  weeklyDigest: boolean;
  marketing: boolean;
}

export interface TwoFactorSecret {
  userId: string;
  secret: string;
  backupCodes: string[];
  verified: boolean;
  method: '2fa-totp' | '2fa-sms';
  createdAt: Date;
  verifiedAt?: Date;
}
