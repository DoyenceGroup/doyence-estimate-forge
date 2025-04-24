
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CompanyMember } from "./CustomerFormTypes";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormType } from "./CustomerFormTypes";

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

type LeadFieldsProps = {
  form: UseFormReturn<CustomerFormType>;
  companyMembers: CompanyMember[];
  watchedLeadSource: string;
};

export const LeadFields: React.FC<LeadFieldsProps> = ({
  form,
  companyMembers,
  watchedLeadSource,
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="lead_source"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lead Source</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(val) => {
                  form.setValue("lead_source", val);
                  if (val !== "Other") {
                    form.setValue("lead_source_description", "");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lead source..." />
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
          control={form.control}
          name="lead_source_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Please specify other lead source</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describe lead source" />
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
        control={form.control}
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
                      {member.first_name || 'Unknown'} {member.last_name || 'User'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
};
