
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Verify from "@/pages/verify";
import ProfileSetup from "@/pages/profile-setup";
import { Toaster } from "@/components/ui/toaster";

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

  // If session exists and profile is completed, go to dashboard
  // If session exists but profile is not completed, go to profile setup
  if (session) {
    if (profile?.profile_completed) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/profile-setup" replace />;
    }
  }

  // No session, show the login/signup page
  return children;
};

const ProfileRedirect = () => {
  const { session, profile, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  // No session, go to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Session exists but profile not completed, go to profile setup
  if (!profile?.profile_completed) {
    return <Navigate to="/profile-setup" replace />;
  }

  // Session exists and profile completed, go to dashboard
  return <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => (
  <Routes>
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
    <Route path="/" element={<ProfileRedirect />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
