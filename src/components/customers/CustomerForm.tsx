
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
  FormField,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type CustomerFormProps = {
  customer?: any;
  onSave: () => void;
  onCancel: () => void;
};

type CompanyMember = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
};

type CustomerFormType = {
  name: string;
  last_name: string;
  cell_numbers: { value: string }[];
  emails: { value: string }[];
  address: string;
  lead_source: string;
  lead_owner_id?: string | null;
  lead_source_description?: string;
};

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

export function CustomerForm({
  customer,
  onSave,
  onCancel,
}: CustomerFormProps) {
  const [leadSource, setLeadSource] = React.useState(
    customer?.lead_source || ""
  );
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCompanyMembers = async () => {
      if (!user?.company_id) {
        console.error('Missing company ID for current user');
        return;
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('company_id', user.company_id)
        .order('first_name');

      if (error) {
        console.error('Error fetching company members:', error);
        return;
      }

      const members = profileData?.map(profile => ({
        user_id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name
      })) || [];

      // Check if current user is already included in the list
      const currentUserIncluded = members.some(member => member.user_id === user.id);
      
      // If not, add current user to the list
      if (!currentUserIncluded && user.id) {
        members.push({
          user_id: user.id,
          first_name: user.first_name || "Current",
          last_name: user.last_name || "User"
        });
      }

      setCompanyMembers(members);
    };

    if (user?.company_id) {
      fetchCompanyMembers();
    } else {
      // If no company_id, at least add the current user
      if (user?.id) {
        setCompanyMembers([{
          user_id: user.id,
          first_name: user.first_name || "Current",
          last_name: user.last_name || "User"
        }]);
      }
    }
  }, [user]);

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
    formState: { errors, isSubmitting },
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
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            rules={{ required: "Name is required" }}
          />
          <FormField
            control={control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            rules={{ required: "Last name is required" }}
          />
        </div>

        <FormItem className="mb-2">
          <FormLabel>Cell Numbers</FormLabel>
          <FormDescription>
            Add up to 5 numbers. At least 1 required.
          </FormDescription>
          <div className="space-y-2 flex flex-col">
            {cellFields.map((field, idx) => (
              <div className="flex items-center gap-2" key={field.id}>
                <Input
                  {...form.register(`cell_numbers.${idx}.value`, {
                    required:
                      idx === 0
                        ? "At least 1 number required"
                        : false,
                    pattern: {
                      value: /^[\d+\s()-]{6,}$/,
                      message: "Invalid number",
                    },
                  })}
                  placeholder={`Number ${idx + 1}`}
                  type="tel"
                />
                {cellFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCell(idx)}
                    aria-label="Remove number"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {cellFields.length < 5 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => appendCell({ value: "" })}
              >
                <Plus className="w-4 h-4" /> Add Number
              </Button>
            )}
          </div>
          <FormMessage>
            {
              errors.cell_numbers?.[0]?.value?.message as string
            }
          </FormMessage>
        </FormItem>

        <FormItem>
          <FormLabel>Emails</FormLabel>
          <FormDescription>
            Add up to 4 emails. At least 1 required.
          </FormDescription>
          <div className="space-y-2 flex flex-col">
            {emailFields.map((field, idx) => (
              <div className="flex items-center gap-2" key={field.id}>
                <Input
                  {...form.register(`emails.${idx}.value`, {
                    required:
                      idx === 0
                        ? "At least 1 email required"
                        : false,
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Invalid email",
                    },
                  })}
                  placeholder={`Email ${idx + 1}`}
                  type="email"
                />
                {emailFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEmail(idx)}
                    aria-label="Remove email"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {emailFields.length < 4 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => appendEmail({ value: "" })}
              >
                <Plus className="w-4 h-4" /> Add Email
              </Button>
            )}
          </div>
          <FormMessage>
            {
              errors.emails?.[0]?.value?.message as string
            }
          </FormMessage>
        </FormItem>

        <FormField
          control={control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Customer address" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="lead_source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead Source</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    setValue("lead_source", val);
                    setLeadSource(val);
                    if (val !== "Other") {
                      setValue("lead_source_description", "");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Select lead source..."
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map((src) => (
                      <SelectItem value={src} key={src}>
                        {src}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        {watchedLeadSource === "Other" && (
          <FormField
            control={control}
            name="lead_source_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Please specify other lead source
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe lead source"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            rules={{
              required:
                watchedLeadSource === "Other"
                  ? "Please describe the lead source"
                  : false,
            }}
          />
        )}

        <FormField
          control={control}
          name="lead_owner_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead Owner</FormLabel>
              <FormControl>
                <Select
                  value={field.value || ''}
                  onValueChange={(val) => field.onChange(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {companyMembers.map((member) => (
                      <SelectItem 
                        key={member.user_id} 
                        value={member.user_id}
                      >
                        {member.first_name || ''} {member.last_name || ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-between mt-6">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={isSubmitting} type="submit">
            <Save className="w-4 h-4 mr-1" />
            {customer ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
