
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Palette } from "lucide-react";

const TAILWIND_PALETTE = [
  // Blue
  { id: "blue-50", color: "#eff6ff" }, { id: "blue-100", color: "#dbeafe" }, { id: "blue-200", color: "#bfdbfe" },
  { id: "blue-300", color: "#93c5fd" }, { id: "blue-400", color: "#60a5fa" }, { id: "blue-500", color: "#3b82f6" },
  { id: "blue-600", color: "#2563eb" }, { id: "blue-700", color: "#1d4ed8" }, { id: "blue-800", color: "#1e40af" },
  { id: "blue-900", color: "#1e3a8a" },

  // Green
  { id: "green-50", color: "#f0fdf4" }, { id: "green-100", color: "#dcfce7" }, { id: "green-200", color: "#bbf7d0" },
  { id: "green-300", color: "#86efac" }, { id: "green-400", color: "#4ade80" }, { id: "green-500", color: "#22c55e" },
  { id: "green-600", color: "#16a34a" }, { id: "green-700", color: "#15803d" }, { id: "green-800", color: "#166534" },
  { id: "green-900", color: "#14532d" },

  // Purple
  { id: "purple-50", color: "#faf5ff" }, { id: "purple-100", color: "#f3e8ff" }, { id: "purple-200", color: "#e9d5ff" },
  { id: "purple-300", color: "#d8b4fe" }, { id: "purple-400", color: "#c084fc" }, { id: "purple-500", color: "#a855f7" },
  { id: "purple-600", color: "#9333ea" }, { id: "purple-700", color: "#7e22ce" }, { id: "purple-800", color: "#6d28d9" },
  { id: "purple-900", color: "#581c87" },

  // Red
  { id: "red-50", color: "#fef2f2" }, { id: "red-100", color: "#fee2e2" }, { id: "red-200", color: "#fecaca" },
  { id: "red-300", color: "#fca5a5" }, { id: "red-400", color: "#f87171" }, { id: "red-500", color: "#ef4444" },
  { id: "red-600", color: "#dc2626" }, { id: "red-700", color: "#b91c1c" }, { id: "red-800", color: "#991b1b" },
  { id: "red-900", color: "#7f1d1d" },

  // Gray/Slate for neutral
  { id: "gray-50", color: "#f9fafb" }, { id: "gray-100", color: "#f3f4f6" }, { id: "gray-200", color: "#e5e7eb" },
  { id: "gray-300", color: "#d1d5db" }, { id: "gray-400", color: "#9ca3af" }, { id: "gray-500", color: "#6b7280" },
  { id: "gray-600", color: "#4b5563" }, { id: "gray-700", color: "#374151" }, { id: "gray-800", color: "#1f2937" },
  { id: "gray-900", color: "#111827" },
];

const getDefaultColor = () => "blue-500";

const CompanyTheme = () => {
  const [selectedId, setSelectedId] = useState(getDefaultColor());
  const [customColor, setCustomColor] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Get the color value
  const selectedThemeColor = isCustom
    ? (customColor.startsWith("#") ? customColor : "#" + customColor)
    : TAILWIND_PALETTE.find(t => t.id === selectedId)?.color || "#3b82f6";

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
        description: `Your company theme color has been updated to ${isCustom ? customColor : selectedId}.`,
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

  const handleSwatchClick = (id: string) => {
    setSelectedId(id);
    setIsCustom(false);
  };

  // HEX validate (simple)
  const isValidHex = (input: string) =>
    /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(input);

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
                Select a color swatch or enter your own custom HEX color.
              </p>
              {/* Palette grid */}
              <div className="grid grid-cols-10 gap-2">
                {TAILWIND_PALETTE.map(theme => (
                  <button
                    key={theme.id}
                    type="button"
                    aria-label={theme.id}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center relative transition-colors
                      ${isCustom ? "" : selectedId === theme.id ? "border-primary-600 ring-2 ring-primary-300" : "border-gray-200"}
                      focus:outline-none`}
                    style={{ backgroundColor: theme.color }}
                    onClick={() => handleSwatchClick(theme.id)}
                  >
                    {selectedId === theme.id && !isCustom && (
                      <span className="absolute inset-0 rounded-full border-2 border-white pointer-events-none"></span>
                    )}
                  </button>
                ))}
              </div>
              {/* Custom HEX input */}
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="text"
                  maxLength={7}
                  placeholder="#123456"
                  aria-label="Custom HEX"
                  className="w-32 px-2 py-1 border rounded text-sm"
                  value={isCustom ? customColor : ""}
                  onFocus={() => setIsCustom(true)}
                  onChange={e => {
                    setCustomColor(e.target.value.replace(/[^#A-Fa-f0-9]/g, ''));
                    setIsCustom(true);
                  }}
                />
                <Button
                  type="button"
                  variant={isCustom ? "default" : "outline"}
                  disabled={!isCustom || !isValidHex(customColor)}
                  style={{
                    backgroundColor: isCustom && isValidHex(customColor) ? (customColor.startsWith("#") ? customColor : `#${customColor}`) : undefined,
                    color: isCustom && isValidHex(customColor) ? "#fff" : undefined
                  }}
                  className="w-8 h-8 min-w-0 p-0 rounded-full border"
                  onClick={() => {
                    if (isValidHex(customColor)) setIsCustom(true);
                  }}
                  aria-label="Custom color preview"
                >
                  #
                </Button>
                <span className="text-xs text-gray-400 ml-1">
                  Enter custom HEX (e.g., #f87171)
                </span>
              </div>
              {isCustom && !isValidHex(customColor) && customColor.length > 0 && (
                <div className="text-red-500 text-xs mt-1">Invalid HEX format.</div>
              )}
            </div>
            <div className="mt-6 pt-6 border-t">
              <Label>Preview</Label>
              <div className="mt-2 p-4 border rounded-md">
                <div className="flex flex-col items-center md:flex-row md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h4 className="font-medium">Button Example</h4>
                    <div className="mt-2 flex space-x-2">
                      <Button
                        style={{ backgroundColor: selectedThemeColor, color: "#fff", borderColor: "#fff" }}
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
          <Button type="submit" disabled={isLoading || (isCustom && !isValidHex(customColor))}
            style={{ backgroundColor: selectedThemeColor, color: "#fff" }}>
            {isLoading ? "Saving..." : "Save Theme"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CompanyTheme;
