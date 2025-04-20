
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import "./route-transitions.css"; // We'll define fade transition here

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
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

// Animated routes wrapper
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition key={location.key} classNames="route-fade" timeout={300}>
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

function App() {
  useEffect(() => {
    const cleanup = initializeSessionTimeout();
    return () => cleanup();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedRoutes />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
