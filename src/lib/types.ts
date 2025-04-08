
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
