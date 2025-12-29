
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  clinic: string;
  location: string;
  region: string;
  fees: string;
  phone: string;
  timing: string;
  // Added optional fields for UI components
  image?: string;
  rating?: string;
}

export interface DoctorApplication {
  id: string;
  full_name: string;
  registration_no: string;
  email: string;
  specialization: string;
  experience: string; 
  region: string;
  phone: string;
  timing: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
}

export interface SuggestionResponse {
  specialization: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  redFlags: string[];
}

export type ViewState = 'home' | 'find-doctor' | 'join-doctor' | 'doctor-list' | 'admin' | 'auth';
