
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
    
    // Calculate lighter and darker variants
    const lighter = themeColor + "20"; // 20% opacity for light variant
    const darker = themeColor;
    
    root.style.setProperty("--theme-color-lighter", lighter);
    root.style.setProperty("--theme-color-darker", darker);
    
  }, [themeColor]);

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};
