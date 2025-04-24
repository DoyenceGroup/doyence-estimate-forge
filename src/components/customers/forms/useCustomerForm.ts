
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { CustomerFormType, CompanyMember } from "./CustomerFormTypes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export function useCustomerForm(customer: any, onSave: () => void) {
  const { user, profile } = useAuth();
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Use profile.company_id instead of user.company_id to properly support impersonation
  const companyId = profile?.company_id || null;

  const form = useForm<CustomerFormType>({
    defaultValues: customer
      ? {
          name: customer.name,
          last_name: customer.last_name,
          cell_numbers: customer.cell_numbers.map((num: string) => ({ value: num })),
          emails: customer.emails.map((email: string) => ({ value: email })),
          address: customer.address,
          lead_source: customer.lead_source || "",
          lead_owner_id: customer.lead_owner_id || null,
          lead_source_description: customer.lead_source_description || "",
        }
      : {
          name: "",
          last_name: "",
          cell_numbers: [{ value: "" }],
          emails: [{ value: "" }],
          address: "",
          lead_source: "",
          lead_owner_id: null,
          lead_source_description: "",
        },
  });

  const {
    fields: cellFields,
    append: appendCell,
    remove: removeCell,
  } = useFieldArray({
    control: form.control,
    name: "cell_numbers",
  });

  const {
    fields: emailFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({
    control: form.control,
    name: "emails",
  });

  // Use the computed companyId based on profile for fetching company members
  useEffect(() => {
    const fetchCompanyMembers = async () => {
      if (!companyId) return;

      try {
        const { data, error } = await supabase
          .from("company_members")
          .select(
            `
            user_id,
            profiles (
              first_name,
              last_name
            )
          `
          )
          .eq("company_id", companyId);

        if (error) {
          console.error("Error fetching company members:", error);
          return;
        }

        // Transform data into the format we need
        setCompanyMembers(
          data.map((member: any) => ({
            user_id: member.user_id,
            first_name: member.profiles?.first_name,
            last_name: member.profiles?.last_name,
          }))
        );
      } catch (error) {
        console.error("Error in fetchCompanyMembers:", error);
      }
    };

    fetchCompanyMembers();
  }, [companyId]);

  const watchedLeadSource = form.watch("lead_source");

  const onSubmit = async (values: CustomerFormType) => {
    setIsSubmitting(true);
    try {
      const transformedData = {
        name: values.name,
        last_name: values.last_name,
        cell_numbers: values.cell_numbers.map((c) => c.value),
        emails: values.emails.map((e) => e.value),
        address: values.address,
        lead_source: values.lead_source,
        lead_owner_id: values.lead_owner_id,
        lead_source_description: values.lead_source_description,
        created_by: user?.id,
      };

      if (customer) {
        // Update existing customer
        const { error } = await supabase
          .from("customers")
          .update(transformedData)
          .eq("id", customer.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Customer updated",
          description: `${values.name} ${values.last_name} has been updated.`,
        });
      } else {
        // Create new customer
        const { error } = await supabase.from("customers").insert(transformedData);

        if (error) {
          throw error;
        }

        toast({
          title: "Customer created",
          description: `${values.name} ${values.last_name} has been added.`,
        });
      }

      onSave();
    } catch (error: any) {
      console.error("Error saving customer:", error);
      toast({
        variant: "destructive",
        title: "Error saving customer",
        description:
          error.message || "There was a problem saving the customer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
    isSubmitting,
  };
}
