
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Palette } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ThemeColor {
  id: string;
  name: string;
  color: string;
  category: "blue" | "green" | "purple" | "red" | "neutral" | "special";
}

const CompanyTheme = () => {
  // Expanded theme options with multiple shades and categories
  const themeColors: ThemeColor[] = [
    // Blue variants
    { id: "blue-500", name: "Primary Blue", color: "#3183ff", category: "blue" },
    { id: "blue-600", name: "Deep Blue", color: "#1a62db", category: "blue" },
    { id: "blue-400", name: "Light Blue", color: "#57a5ff", category: "blue" },
    { id: "blue-700", name: "Navy Blue", color: "#1a4caf", category: "blue" },
    { id: "sky-500", name: "Sky Blue", color: "#0ea5e9", category: "blue" },
    { id: "cyan-500", name: "Cyan", color: "#06b6d4", category: "blue" },
    
    // Green variants
    { id: "green-500", name: "Emerald", color: "#10b981", category: "green" },
    { id: "green-600", name: "Forest", color: "#059669", category: "green" },
    { id: "green-400", name: "Mint", color: "#34d399", category: "green" },
    { id: "green-700", name: "Deep Green", color: "#047857", category: "green" },
    { id: "lime-500", name: "Lime", color: "#84cc16", category: "green" },
    { id: "teal-500", name: "Teal", color: "#14b8a6", category: "green" },
    
    // Purple variants
    { id: "purple-500", name: "Purple", color: "#8b5cf6", category: "purple" },
    { id: "purple-600", name: "Royal Purple", color: "#7c3aed", category: "purple" },
    { id: "purple-400", name: "Lavender", color: "#a78bfa", category: "purple" },
    { id: "purple-700", name: "Deep Purple", color: "#6d28d9", category: "purple" },
    { id: "indigo-500", name: "Indigo", color: "#6366f1", category: "purple" },
    { id: "violet-500", name: "Violet", color: "#8b5cf6", category: "purple" },
    
    // Red & Warm variants
    { id: "red-500", name: "Red", color: "#ef4444", category: "red" },
    { id: "red-600", name: "Ruby", color: "#dc2626", category: "red" },
    { id: "red-400", name: "Coral", color: "#f87171", category: "red" },
    { id: "pink-500", name: "Pink", color: "#ec4899", category: "red" },
    { id: "rose-500", name: "Rose", color: "#f43f5e", category: "red" },
    { id: "amber-500", name: "Amber", color: "#f59e0b", category: "red" },
    { id: "orange-500", name: "Orange", color: "#f97316", category: "red" },
    
    // Neutral variants
    { id: "slate-700", name: "Slate", color: "#334155", category: "neutral" },
    { id: "gray-600", name: "Gray", color: "#4b5563", category: "neutral" },
    { id: "zinc-600", name: "Zinc", color: "#52525b", category: "neutral" },
    { id: "stone-600", name: "Stone", color: "#57534e", category: "neutral" },
    { id: "neutral-600", name: "Neutral", color: "#525252", category: "neutral" },
    
    // Special colors
    { id: "fuchsia-500", name: "Fuchsia", color: "#d946ef", category: "special" },
    { id: "yellow-500", name: "Yellow", color: "#eab308", category: "special" },
    { id: "brown-600", name: "Brown", color: "#92400e", category: "special" },
    { id: "emerald-600", name: "Jungle", color: "#059669", category: "special" },
    { id: "sky-400", name: "Azure", color: "#38bdf8", category: "special" }
  ];

  const [selectedColor, setSelectedColor] = useState("blue-500");
  const [activeCategory, setActiveCategory] = useState<ThemeColor["category"]>("blue");
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

  const filteredColors = themeColors.filter(color => color.category === activeCategory);
  const selectedThemeColor = themeColors.find(t => t.id === selectedColor)?.color;

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
                This color will be used as the primary accent throughout the application.
              </p>
              
              {/* Color Category Selection */}
              <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as ThemeColor["category"])} className="mb-6">
                <TabsList className="grid grid-cols-6 w-full">
                  <TabsTrigger value="blue">Blue</TabsTrigger>
                  <TabsTrigger value="green">Green</TabsTrigger>
                  <TabsTrigger value="purple">Purple</TabsTrigger>
                  <TabsTrigger value="red">Red</TabsTrigger>
                  <TabsTrigger value="neutral">Neutral</TabsTrigger>
                  <TabsTrigger value="special">Special</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Color Selection */}
              <RadioGroup 
                value={selectedColor} 
                onValueChange={setSelectedColor}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
              >
                {filteredColors.map((theme) => (
                  <div key={theme.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={theme.id} id={`theme-${theme.id}`} />
                    <Label htmlFor={`theme-${theme.id}`} className="flex items-center">
                      <span 
                        className="w-6 h-6 rounded-full mr-2 border border-gray-200" 
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
                        style={{ backgroundColor: selectedThemeColor }}
                      >
                        Primary Button
                      </Button>
                      <Button variant="outline" style={{ borderColor: selectedThemeColor, color: selectedThemeColor }}>
                        Outline
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Text Example</h4>
                    <div className="mt-2">
                      <span 
                        className="font-medium" 
                        style={{ color: selectedThemeColor }}
                      >
                        This text uses your primary color
                      </span>
                    </div>
                    <div className="mt-2 p-2 rounded" style={{ backgroundColor: selectedThemeColor + '10' }}>
                      <span>Background tint example</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} style={{ backgroundColor: selectedThemeColor }}>
            {isLoading ? "Saving..." : "Save Theme"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CompanyTheme;
