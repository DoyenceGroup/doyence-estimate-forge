
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";
import type { AuthContextType } from "./auth-types";

// Custom hook
export const useAuth = (): AuthContextType => useContext(AuthContext);
