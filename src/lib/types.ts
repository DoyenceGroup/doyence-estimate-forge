
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
  lead_owner_id?: string | null;
  cell_numbers?: string[];
  emails?: string[];
  lead_source?: string | null;
  lead_source_description?: string | null;
  last_name: string;
}

export interface UserProfile {
  id: string;
  user_id?: string; // Made optional since it's missing in some queries
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  profile_photo_url: string | null;
  company_role: string | null;
  role: string | null;
  profile_completed: boolean | null;
  company_id: string | null;
  company_name: string | null;
  company_email: string | null;
  company_address: string | null;
  logo_url: string | null;
  website: string | null;
  status?: string | null;
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

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface AdminUser {
  id: string;
  role: 'user' | 'admin' | 'superuser'; // Updated to include 'user' type
  created_at: string;
  created_by?: string;
  is_active: boolean;
  profiles?: { // Added profiles property to match the join query
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

export interface AnalyticsData {
  total_users: number;
  total_companies: number;
  total_customers: number;
  avg_users_per_company: number;
  logins_per_day?: {
    date: string;
    count: number;
  }[];
  active_companies?: {
    id: string;
    name: string;
    activity_count: number;
  }[];
}
