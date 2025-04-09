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
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Estimates from "./pages/Estimates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Custom wrapper to handle redirects
const AppRoutes = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is logged in and lands on login/register, redirect to profile-setup or dashboard
    if (session) {
      const isOnAuthPage = ["/login", "/register"].includes(location.pathname);
      if (isOnAuthPage) {
        navigate("/profile-setup");
      }
    }

    // If user landed via magic link and session is created
    if (
      session &&
      location.hash.includes("access_token") &&
      location.pathname === "/"
    ) {
      navigate("/profile-setup");
    }
  }, [session, navigate, location]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/estimates" element={<Estimates />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

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
