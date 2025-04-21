
import { createContext, useState, useContext, useEffect, ReactNode } from "react";

type ThemeContextType = {
  themeColor: string;
  setThemeColor: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Get the theme from localStorage or use default color
  const [themeColor, setThemeColor] = useState<string>(() => {
    const savedTheme = localStorage.getItem("companyTheme");
    return savedTheme || "#3b82f6"; // Default blue color
  });

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("companyTheme", themeColor);
    
    // Update CSS variables for theming
    const root = document.documentElement;
    root.style.setProperty("--theme-color", themeColor);
    
    // Calculate additional theme variants with different opacities
    root.style.setProperty("--theme-color-lighter", themeColor + "20");
    root.style.setProperty("--theme-color-light", themeColor + "40");
    root.style.setProperty("--theme-color-medium", themeColor + "70");
    root.style.setProperty("--theme-color-darker", themeColor);
    
    // Also apply to the Tailwind primary color variable to affect all Shadcn UI components
    const hsl = hexToHSL(themeColor);
    if (hsl) {
      const { h, s, l } = hsl;
      root.style.setProperty("--primary", `${h} ${s}% ${l}%`);
      // Also set the ring color
      root.style.setProperty("--ring", `${h} ${s}% ${l}%`);
    }
  }, [themeColor]);

  // Helper function to convert hex color to HSL
  const hexToHSL = (hex: string): { h: number; s: number; l: number } | null => {
    // Remove the hash if it exists
    hex = hex.replace(/^#/, '');

    // Parse the hex values
    let r, g, b;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16) / 255;
      g = parseInt(hex[1] + hex[1], 16) / 255;
      b = parseInt(hex[2] + hex[2], 16) / 255;
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16) / 255;
      g = parseInt(hex.substring(2, 4), 16) / 255;
      b = parseInt(hex.substring(4, 6), 16) / 255;
    } else {
      return null; // Invalid hex color
    }

    // Find the min and max values to calculate the lightness
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          h = 0;
      }
      h = Math.round(h * 60);
    }

    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return { h, s, l };
  };

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};
