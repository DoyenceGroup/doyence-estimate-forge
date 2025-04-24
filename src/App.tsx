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
import Customers from "@/pages/customers";
import AdminDashboard from "@/pages/admin"; 
import ImpersonationBanner from "@/components/layout/ImpersonationBanner";
import { Toaster } from "@/components/ui/toaster";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./route-transitions.css";

const LoadingSpinner = () => (
  <div className="p-8 flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <span>Loading...</span>
    </div>
  </div>
);

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

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { session, isLoading, isAdmin, isSuperuser, user } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  useEffect(() => {
    if (!isLoading) {
      setHasCheckedAuth(true);
    }
  }, [isLoading]);
  
  if (!hasCheckedAuth) {
    return <LoadingSpinner />;
  }
  
  if (!session) {
    return <Navigate to="/login" />;
  }
  
  // Block access to admin routes when being impersonated
  if (user?.impersonated) {
    return <Navigate to="/dashboard" />;
  }
  
  return (isAdmin || isSuperuser) ? children : <Navigate to="/dashboard" />;
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

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <>
      <ImpersonationBanner />
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
              path="/customers"
              element={
                <ProtectedRoute>
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
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
    </>
  );
};

function AppWithProviders() {
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

function App() {
  return (
    <BrowserRouter>
      <AppWithProviders />
    </BrowserRouter>
  );
}

export default App;
