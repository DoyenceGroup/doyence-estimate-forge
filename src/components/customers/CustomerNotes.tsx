
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { formatDistance } from "date-fns";

interface CustomerNotesProps {
  customerId: string;
}

interface Note {
  id: string;
  customer_id: string;
  author_id: string;
  note: string;
  created_at: string;
  updated_at: string;
}

const formSchema = z.object({
  note: z.string().min(1, "Note cannot be empty").max(1000, "Note is too long (maximum 1000 characters)"),
});

type FormData = z.infer<typeof formSchema>;

const CustomerNotes: React.FC<CustomerNotesProps> = ({ customerId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      note: "",
    },
  });

  useEffect(() => {
    loadNotes();
  }, [customerId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("customer_notes")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notes:", error);
        toast({
          title: "Error loading notes",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setNotes(data || []);
    } catch (error) {
      console.error("Error in loadNotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: FormData) => {
    try {
      const userResponse = await supabase.auth.getUser();
      const userId = userResponse.data.user?.id;

      if (!userId) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to add notes.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("customer_notes").insert({
        customer_id: customerId,
        author_id: userId,
        note: formData.note,
      });

      if (error) {
        toast({
          title: "Error adding note",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Note added",
        description: "Your note has been saved successfully.",
      });

      form.reset();
      loadNotes();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("customer_notes")
        .delete()
        .eq("id", noteId);

      if (error) {
        toast({
          title: "Error deleting note",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Note deleted",
        description: "Note has been deleted successfully",
      });

      loadNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Note</CardTitle>
          <CardDescription>Add a note about this customer</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Add a note about this customer..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit">Add Note</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notes</h3>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-4 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No notes found for this customer.</p>
          </div>
        ) : (
          notes.map((note) => (
            <Card key={note.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardDescription>{formatDate(note.created_at)}</CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this note.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteNote(note.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{note.note}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerNotes;
