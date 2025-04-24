import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/useAuth";
import { CustomerFormType, CompanyMember } from "./CustomerFormTypes";

const LEAD_SOURCES = [
  "Word of Mouth",
  "Website",
  "LocalPros",
  "Bark",
  "Facebook",
  "Instagram",
  "LinkedIn",
  "Car Branding",
  "House Branding",
  "Youtube",
  "Other",
];

export function useCustomerForm(customer: any, onSave: () => void) {
  const [leadSource, setLeadSource] = useState(customer?.lead_source || "");
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  useEffect(() => {
    const fetchCompanyMembers = async () => {
      if (!profile?.company_id) {
        console.error('Missing company ID for current user');
        return;
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('company_id', profile.company_id)
        .order('first_name');

      if (error) {
        console.error('Error fetching company members:', error);
        return;
      }

      const members = profileData?.map(profile => ({
        user_id: profile.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || ''
      })) || [];

      // Check if current user is already included in the list
      const currentUserIncluded = members.some(member => member.user_id === user?.id);
      
      // If not, add current user to the list with proper name handling
      if (!currentUserIncluded && user?.id) {
        // Fetch current user profile to ensure we have the most up-to-date name
        const { data: currentUserProfile, error: userError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
          
        if (!userError && currentUserProfile) {
          members.push({
            user_id: user.id,
            first_name: currentUserProfile.first_name || 'Unknown',
            last_name: currentUserProfile.last_name || 'User'
          });
        } else {
          members.push({
            user_id: user.id,
            first_name: profile?.first_name || 'Unknown',
            last_name: profile?.last_name || 'User'
          });
        }
      }

      setCompanyMembers(members);
    };

    if (profile?.company_id) {
      fetchCompanyMembers();
    } else {
      // If no company_id, at least add the current user
      if (user?.id) {
        // Fetch current user profile to ensure we have the most up-to-date name
        const fetchCurrentUserProfile = async () => {
          const { data: currentUserProfile, error } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single();
            
          if (!error && currentUserProfile) {
            setCompanyMembers([{
              user_id: user.id,
              first_name: currentUserProfile.first_name || 'Unknown',
              last_name: currentUserProfile.last_name || 'User'
            }]);
          } else {
            setCompanyMembers([{
              user_id: user.id,
              first_name: profile?.first_name || 'Unknown',
              last_name: profile?.last_name || 'User'
            }]);
          }
        };
        
        fetchCurrentUserProfile();
      }
    }
  }, [user, profile]);

  const form = useForm<CustomerFormType>({
    defaultValues: customer
      ? {
          name: customer.name ?? "",
          last_name: customer.last_name ?? "",
          cell_numbers:
            customer.cell_numbers?.map((n: string) => ({ value: n })) ||
            [{ value: "" }],
          emails:
            customer.emails?.map((e: string) => ({ value: e })) ||
            [{ value: "" }],
          address: customer.address || "",
          lead_source: customer.lead_source || "",
          lead_owner_id: customer.lead_owner_id || user?.id || null,
          lead_source_description: customer.lead_source_description || "",
        }
      : {
          name: "",
          last_name: "",
          cell_numbers: [{ value: "" }],
          emails: [{ value: "" }],
          address: "",
          lead_source: "",
          lead_owner_id: user?.id || null,
          lead_source_description: "",
        },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  const {
    fields: cellFields,
    append: appendCell,
    remove: removeCell,
  } = useFieldArray({ name: "cell_numbers", control });
  
  const {
    fields: emailFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({ name: "emails", control });

  const watchedLeadSource = watch("lead_source");

  async function onSubmit(values: CustomerFormType) {
    try {
      setIsSubmitting(true);
      
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id;

      if (!userId) {
        toast({
          title: "User not found",
          description: "You must be logged in.",
          variant: "destructive",
        });
        return;
      }

      const newCustomer = {
        name: values.name,
        last_name: values.last_name,
        cell_numbers: values.cell_numbers.map((c) => c.value).filter(Boolean),
        emails: values.emails.map((e) => e.value).filter(Boolean),
        address: values.address,
        lead_source: values.lead_source,
        lead_owner_id: values.lead_owner_id || null,
        lead_source_description:
          values.lead_source === "Other"
            ? values.lead_source_description
            : null,
      };

      console.log("Saving customer with data:", newCustomer);

      let result;
      if (customer) {
        result = await supabase
          .from("customers")
          .update({
            ...newCustomer,
            updated_at: new Date().toISOString(),
          })
          .eq("id", customer.id);
      } else {
        result = await supabase.from("customers").insert({
          ...newCustomer,
          created_by: userId,
        });
      }

      if (result.error) {
        console.error("Error saving customer:", result.error);
        toast({
          title: "Error saving customer",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      onSave();
      reset();
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast({
        title: "Error saving customer",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    companyMembers,
    cellFields,
    emailFields,
    appendCell,
    removeCell,
    appendEmail,
    removeEmail,
    watchedLeadSource,
    onSubmit,
    isSubmitting
  };
}
