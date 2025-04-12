import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/authcontext";
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
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return session ? <Navigate to="/dashboard" /> : children;
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
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
