
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
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

// Loading component to prevent multiple loaders being created
const LoadingSpinner = () => (
  <div className="p-8 flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <span>Loading...</span>
    </div>
  </div>
);

// Modified to prevent unnecessary remounts when switching tabs
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { session, isLoading } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  useEffect(() => {
    if (!isLoading) {
      setHasCheckedAuth(true);
    }
  }, [isLoading]);
  
  if (!hasCheckedAuth) {
    return <LoadingSpinner />;
  }
  
  return session ? children : <Navigate to="/login" />;
};

const UnauthenticatedOnlyRoute = ({ children }: { children: JSX.Element }) => {
  const { session, isLoading, profile } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  useEffect(() => {
    if (!isLoading) {
      setHasCheckedAuth(true);
    }
  }, [isLoading]);
  
  if (!hasCheckedAuth) {
    return <LoadingSpinner />;
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

// Improved AnimatedRoutes with persistent memory between tab switches
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

// App wrapper with memory-efficient session timeout
function AppWithProviders() {
  // Use a ref to track if this is the first mount to prevent unnecessary reinitializations
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    if (!initialized) {
      const cleanup = initializeSessionTimeout();
      setInitialized(true);
      return cleanup;
    }
  }, [initialized]);

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
