
import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormDescription, FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type CustomerFormProps = {
  customer?: any;
  onSave: () => void;
  onCancel: () => void;
};

type CustomerFormType = {
  name: string;
  last_name: string;
  cell_numbers: { value: string }[];
  emails: { value: string }[];
  address: string;
  lead_source: string;
};

export function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  const form = useForm<CustomerFormType>({
    defaultValues: customer
      ? {
          name: customer.name,
          last_name: customer.last_name,
          cell_numbers: customer.cell_numbers?.map((n: string) => ({ value: n })) || [{ value: "" }, { value: "" }, { value: "" }],
          emails: customer.emails?.map((e: string) => ({ value: e })) || [{ value: "" }, { value: "" }],
          address: customer.address || "",
          lead_source: customer.lead_source || "",
        }
      : {
          name: "",
          last_name: "",
          cell_numbers: [{ value: "" }, { value: "" }, { value: "" }],
          emails: [{ value: "" }, { value: "" }],
          address: "",
          lead_source: "",
        },
  });

  const {
    control,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
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

  async function onSubmit(values: CustomerFormType) {
    const newCustomer = {
      name: values.name,
      last_name: values.last_name,
      cell_numbers: values.cell_numbers.map((c) => c.value).filter(Boolean),
      emails: values.emails.map((e) => e.value).filter(Boolean),
      address: values.address,
      lead_source: values.lead_source,
    };
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
      result = await supabase
        .from("customers")
        .insert({
          ...newCustomer,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });
    }
    onSave();
    reset();
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
                <FormMessage>{errors.name?.message}</FormMessage>
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
                <FormMessage>{errors.last_name?.message}</FormMessage>
              </FormItem>
            )}
            rules={{ required: "Last name is required" }}
          />
        </div>
        
        <FormItem className="mb-2">
          <FormLabel>Cell Numbers</FormLabel>
          <FormDescription>Add up to 5 numbers. At least 3 required.</FormDescription>
          <div className="space-y-2 flex flex-col">
            {cellFields.map((field, idx) => (
              <div className="flex items-center gap-2" key={field.id}>
                <Input
                  {...register(`cell_numbers.${idx}.value`, {
                    required: idx < 3 ? "At least 3 numbers required" : false,
                    pattern: { value: /^[\d+\s()-]{6,}$/, message: "Invalid number" },
                  })}
                  placeholder={`Number ${idx + 1}`}
                  type="tel"
                />
                {cellFields.length > 3 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeCell(idx)} aria-label="Remove number">
                    <Trash className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {cellFields.length < 5 && (
              <Button type="button" variant="secondary" onClick={() => appendCell({ value: "" })}>
                <Plus className="w-4 h-4" /> Add Number
              </Button>
            )}
          </div>
          <FormMessage>
            {errors.cell_numbers && errors.cell_numbers[0]?.value?.message}
          </FormMessage>
        </FormItem>
        
        <FormItem>
          <FormLabel>Emails</FormLabel>
          <FormDescription>Add up to 4 emails. At least 2 required.</FormDescription>
          <div className="space-y-2 flex flex-col">
            {emailFields.map((field, idx) => (
              <div className="flex items-center gap-2" key={field.id}>
                <Input
                  {...register(`emails.${idx}.value`, {
                    required: idx < 2 ? "At least 2 emails required" : false,
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                  })}
                  placeholder={`Email ${idx + 1}`}
                  type="email"
                />
                {emailFields.length > 2 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeEmail(idx)} aria-label="Remove email">
                    <Trash className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {emailFields.length < 4 && (
              <Button type="button" variant="secondary" onClick={() => appendEmail({ value: "" })}>
                <Plus className="w-4 h-4" /> Add Email
              </Button>
            )}
          </div>
          <FormMessage>
            {errors.emails && errors.emails[0]?.value?.message}
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
                <Input {...field} placeholder="Lead source" />
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
