
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
