
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Palette } from "lucide-react";
import PaintColorPicker from "./PaintColorPicker";

// Removed the TAILWIND_PALETTE array as we're using the MS Paint style picker

const getDefaultColor = () => "#3b82f6"; // Default to a blue color

const CompanyTheme = () => {
  const [selectedColor, setSelectedColor] = useState(getDefaultColor());
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
      // Future: Save the theme to user's company
      toast({
        title: "Theme updated",
        description: `Your company theme color has been updated to ${selectedColor}.`,
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
          <div className="space-y-6">
            <div>
              <Label>Primary Color</Label>
              <p className="text-sm text-gray-500 mb-4">
                Select or pick your company brand color below.
              </p>
              {/* MS Paint style color picker */}
              <PaintColorPicker
                value={selectedColor}
                onChange={setSelectedColor}
              />
            </div>
            <div className="mt-6 pt-6 border-t">
              <Label>Preview</Label>
              <div className="mt-2 p-4 border rounded-md">
                <div className="flex flex-col items-center md:flex-row md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h4 className="font-medium">Button Example</h4>
                    <div className="mt-2 flex space-x-2">
                      <Button
                        style={{ backgroundColor: selectedColor, color: "#fff", borderColor: "#fff" }}
                      >
                        Primary Button
                      </Button>
                      <Button variant="outline" style={{ borderColor: selectedColor, color: selectedColor }}>
                        Outline
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Text Example</h4>
                    <div className="mt-2">
                      <span
                        className="font-medium"
                        style={{ color: selectedColor }}
                      >
                        This text uses your primary color
                      </span>
                    </div>
                    <div className="mt-2 p-2 rounded" style={{ backgroundColor: selectedColor + '10' }}>
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
            style={{ backgroundColor: selectedColor, color: "#fff" }}>
            {isLoading ? "Saving..." : "Save Theme"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CompanyTheme;
