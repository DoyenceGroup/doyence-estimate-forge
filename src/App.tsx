import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useEffect } from "react";
import { initializeSessionTimeout } from "@/utils/sessionTimeout";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Verify from "@/pages/verify";
import ProfileSetup from "@/pages/profile-setup";
import Index from "@/pages/Index";
import Settings from "@/pages/company/Settings";
import { Toaster } from "@/components/ui/toaster";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./route-transitions.css";

// First define the components that need auth context
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <span>Loading...</span>
      </div>
    </div>;
  }

  return session ? children : <Navigate to="/login" />;
};

const UnauthenticatedOnlyRoute = ({ children }: { children: JSX.Element }) => {
  const { session, isLoading, profile } = useAuth();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (session) {
    if (profile?.profile_completed) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/profile-setup" replace />;
    }
  }

  return children;
};

// Improved AnimatedRoutes with key that won't change on tab switches
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition 
        key={location.pathname} 
        classNames="route-fade" 
        timeout={300}
        mountOnEnter
        unmountOnExit
      >
        <Routes location={location}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-setup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <UnauthenticatedOnlyRoute>
                <Login />
              </UnauthenticatedOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <UnauthenticatedOnlyRoute>
                <Signup />
              </UnauthenticatedOnlyRoute>
            }
          />
          <Route path="/verify" element={<Verify />} />
          <Route path="/" element={<Index />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
};

// App wrapper with proper provider hierarchy and improved session timeout
function AppWithProviders() {
  useEffect(() => {
    const cleanup = initializeSessionTimeout();
    return cleanup;
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <AnimatedRoutes />
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
}

// Root component that gets mounted
function App() {
  return (
    <BrowserRouter>
      <AppWithProviders />
    </BrowserRouter>
  );
}

export default App;
