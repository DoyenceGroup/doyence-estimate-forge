
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Palette } from "lucide-react";

interface ThemeColor {
  id: string;
  name: string;
  color: string;
}

const CompanyTheme = () => {
  // Mock theme options - in a real app, these could come from your design system
  const themeColors: ThemeColor[] = [
    { id: "blue", name: "Blue", color: "#3183ff" },
    { id: "green", name: "Green", color: "#10b981" },
    { id: "purple", name: "Purple", color: "#8b5cf6" },
    { id: "red", name: "Red", color: "#ef4444" },
    { id: "amber", name: "Amber", color: "#f59e0b" },
    { id: "pink", name: "Pink", color: "#ec4899" },
  ];

  const [selectedColor, setSelectedColor] = useState("blue");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to update the theme.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, we would save the theme to the user's company settings
      // For now, we'll just show a success message
      console.log("Selected theme color:", selectedColor);
      
      toast({
        title: "Theme updated",
        description: "Your company theme has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update theme",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSaveTheme}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Company Theme
          </CardTitle>
          <CardDescription>
            Customize your company colors and branding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Primary Color</Label>
              <p className="text-sm text-gray-500 mb-4">
                This color will be used as the primary accent throughout the application.
              </p>
              
              <RadioGroup 
                value={selectedColor} 
                onValueChange={setSelectedColor}
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
              >
                {themeColors.map((theme) => (
                  <div key={theme.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={theme.id} id={`theme-${theme.id}`} />
                    <Label htmlFor={`theme-${theme.id}`} className="flex items-center">
                      <span 
                        className="w-6 h-6 rounded-full mr-2" 
                        style={{ backgroundColor: theme.color }}
                      ></span>
                      {theme.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <Label>Preview</Label>
              <div className="mt-2 p-4 border rounded-md">
                <div className="flex flex-col items-center md:flex-row md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h4 className="font-medium">Button Example</h4>
                    <div className="mt-2 flex space-x-2">
                      <Button 
                        style={{ 
                          backgroundColor: themeColors.find(t => t.id === selectedColor)?.color 
                        }}
                      >
                        Primary Button
                      </Button>
                      <Button variant="outline">Secondary</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Text Example</h4>
                    <div className="mt-2">
                      <span 
                        className="font-medium" 
                        style={{ 
                          color: themeColors.find(t => t.id === selectedColor)?.color 
                        }}
                      >
                        This text uses your primary color
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Theme"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CompanyTheme;
