
import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ContactInfoFields } from "./ContactInfoFields";
import { LeadFields } from "./LeadFields";
import { useCustomerForm } from "./useCustomerForm";
import type { CustomerFormProps } from "./CustomerFormTypes";

export function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  const {
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
  } = useCustomerForm(customer, onSave);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
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
            control={form.control}
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

        <ContactInfoFields
          form={form}
          cellFields={cellFields}
          emailFields={emailFields}
          appendCell={appendCell}
          removeCell={removeCell}
          appendEmail={appendEmail}
          removeEmail={removeEmail}
        />

        <FormField
          control={form.control}
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

        <LeadFields
          form={form}
          companyMembers={companyMembers}
          watchedLeadSource={watchedLeadSource}
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
