
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";
import type { AuthContextType } from "./auth-types";

// Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
