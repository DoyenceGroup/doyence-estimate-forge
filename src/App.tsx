import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Estimates from "./pages/Estimates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 🚦 Custom route logic for handling redirect conditions
const AppRoutes = () => {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return; // 🛑 Don't redirect while still loading

    const isOnAuthPage = ["/login", "/register", "/verify"].includes(location.pathname);
    const isOnProfileSetup = location.pathname === "/profile-setup";
    const isOnRootWithToken = location.pathname === "/" && location.hash.includes("access_token");

    if (session) {
      if (isOnAuthPage || isOnRootWithToken) {
        if (profile?.profile_completed) {
          navigate("/dashboard");
        } else {
          navigate("/profile-setup");
        }
      }

      if (isOnProfileSetup && profile?.profile_completed) {
        navigate("/dashboard");
      }
    }
  }, [session, profile, loading, location, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyEmail />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/estimates" element={<Estimates />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// 🔧 Main App setup with Providers
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
