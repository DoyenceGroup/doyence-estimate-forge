
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phoneNumber: string;
  website?: string;
  logoUrl?: string;
}

export interface Estimate {
  id: string;
  title: string;
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  profile_photo_url: string | null;
  company_role: string | null;
  role: string | null;
  profile_completed: boolean;
  company_id: string | null;
  company_name: string | null;
  company_email: string | null;
  company_address: string | null;
  logo_url: string | null;
  website: string | null;
}

export interface TeamMemberProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  profile_photo_url: string | null;
}

export interface TeamMemberData {
  id: string;
  user_id: string;
  role: string;
  profiles: TeamMemberProfile[];
}

export interface TeamMember {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string;
  profile_photo_url: string | null;
}

export interface CompanyMember {
  id: string;
  user_id: string;
  company_id: string;
  role: string;
  joined_at: string;
}

export interface CompanyInvitation {
  id: string;
  email: string;
  company_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  expires_at?: string;
  created_by: string;
}
