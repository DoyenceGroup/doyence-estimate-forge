
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormType } from "./CustomerFormTypes";

type ContactInfoFieldsProps = {
  form: UseFormReturn<CustomerFormType>;
  cellFields: any[];
  emailFields: any[];
  appendCell: () => void;
  removeCell: (index: number) => void;
  appendEmail: () => void;
  removeEmail: (index: number) => void;
};

export const ContactInfoFields: React.FC<ContactInfoFieldsProps> = ({
  form,
  cellFields,
  emailFields,
  appendCell,
  removeCell,
  appendEmail,
  removeEmail,
}) => {
  return (
    <>
      <FormItem className="mb-2">
        <FormLabel>Cell Numbers</FormLabel>
        <div className="space-y-2 flex flex-col">
          {cellFields.map((field, idx) => (
            <div className="flex items-center gap-2" key={field.id}>
              <Input
                {...form.register(`cell_numbers.${idx}.value`, {
                  required: idx === 0 ? "At least 1 number required" : false,
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
              onClick={() => appendCell()}
            >
              <Plus className="w-4 h-4" /> Add Number
            </Button>
          )}
        </div>
        <FormMessage>
          {form.formState.errors.cell_numbers?.[0]?.value?.message}
        </FormMessage>
      </FormItem>

      <FormItem>
        <FormLabel>Emails</FormLabel>
        <div className="space-y-2 flex flex-col">
          {emailFields.map((field, idx) => (
            <div className="flex items-center gap-2" key={field.id}>
              <Input
                {...form.register(`emails.${idx}.value`, {
                  required: idx === 0 ? "At least 1 email required" : false,
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
              onClick={() => appendEmail()}
            >
              <Plus className="w-4 h-4" /> Add Email
            </Button>
          )}
        </div>
        <FormMessage>
          {form.formState.errors.emails?.[0]?.value?.message}
        </FormMessage>
      </FormItem>
    </>
  );
};
