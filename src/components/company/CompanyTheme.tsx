
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Palette } from "lucide-react";
import ColorPicker from "@/components/ui/ColorPicker";
import { supabase } from "@/integrations/supabase/client";

const CompanyTheme = () => {
  const [customColor, setCustomColor] = useState("#3183ff");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  // Load saved theme color on component mount
  useEffect(() => {
    const loadThemeSettings = async () => {
      if (profile?.company_id) {
        const { data, error } = await supabase
          .from('companies')
          .select('theme_color')
          .eq('id', profile.company_id)
          .maybeSingle();
        
        if (data?.theme_color) {
          setCustomColor(data.theme_color);
        }
      }
    };
    
    loadThemeSettings();
  }, [profile]);

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !profile?.company_id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in with a company to update the theme.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      // Update company theme color
      const { error } = await supabase
        .from('companies')
        .update({
          theme_color: customColor,
          updated_at: new Date().toISOString()
        })
        .eq("id", profile.company_id);
      
      if (error) throw error;
      
      toast({
        title: "Theme updated",
        description: `Your company theme color has been updated to ${customColor}.`,
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

  const handleColorChange = (color: string) => {
    setCustomColor(color);
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
          <div className="space-y-6">
            <div>
              <Label>Primary Color</Label>
              <p className="text-sm text-gray-500 mb-4">
                Use the color picker to select your company brand color.
              </p>
              <ColorPicker value={customColor} onChange={handleColorChange} />
              <div className="mt-2 text-xs">Current: <span style={{ color: customColor }}>{customColor}</span></div>
            </div>
            <div className="mt-6 pt-6 border-t">
              <Label>Preview</Label>
              <div className="mt-2 p-4 border rounded-md">
                <div className="flex flex-col items-center md:flex-row md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h4 className="font-medium">Button Example</h4>
                    <div className="mt-2 flex space-x-2">
                      <Button
                        style={{ backgroundColor: customColor, color: "#fff", borderColor: "#fff" }}
                      >
                        Primary Button
                      </Button>
                      <Button variant="outline" style={{ borderColor: customColor, color: customColor }}>
                        Outline
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Text Example</h4>
                    <div className="mt-2">
                      <span
                        className="font-medium"
                        style={{ color: customColor }}
                      >
                        This text uses your primary color
                      </span>
                    </div>
                    <div className="mt-2 p-2 rounded" style={{ backgroundColor: customColor + '10' }}>
                      <span>Background tint example</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}
            style={{ backgroundColor: customColor, color: "#fff" }}>
            {isLoading ? "Saving..." : "Save Theme"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CompanyTheme;
