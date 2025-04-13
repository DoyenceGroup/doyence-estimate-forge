import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
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

  if (session) {
    if (profile?.profile_completed) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/profile-setup" replace />;
    }
  }

  return children;
};

const ProfileRedirect = () => {
  const { session, profile, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!profile?.profile_completed) {
    return <Navigate to="/profile-setup" replace />;
  }

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
