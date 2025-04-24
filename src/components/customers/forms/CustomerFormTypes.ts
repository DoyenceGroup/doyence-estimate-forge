
import { UseFormReturn } from "react-hook-form";

export type CustomerFormType = {
  name: string;
  last_name: string;
  cell_numbers: { value: string }[];
  emails: { value: string }[];
  address: string;
  lead_source: string;
  lead_owner_id?: string | null;
  lead_source_description?: string;
};

export type CompanyMember = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
};

export type CustomerFormProps = {
  customer?: any;
  onSave: () => void;
  onCancel: () => void;
};
