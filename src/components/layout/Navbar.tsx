
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, UserCircle, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

const Navbar = ({ onMobileMenuToggle }: NavbarProps) => {
  const { user, signOut } = useAuth();
  const [profileData, setProfileData] = useState<Partial<User> | null>(null);
  const navigate = useNavigate();
  
  // We'll use the user object directly from the auth context
  // No need to fetch from localStorage

  const handleLogout = async () => {
    await signOut();
    // Navigation is handled in the AuthContext
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section - Logo and Mobile Menu */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden -ml-2 p-2 text-gray-500 hover:text-gray-700"
              onClick={onMobileMenuToggle}
            >
              <Menu size={24} />
            </button>
            <Link to="/dashboard" className="flex items-center">
              <span className="text-xl font-montserrat font-bold text-primary-700">
                Doyence Estimating
              </span>
            </Link>
          </div>

          {/* Right section - User menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-gray-100 rounded-full px-3 py-2"
                  >
                    <UserCircle className="h-6 w-6 text-gray-600" />
                    <span className="hidden sm:inline-block font-medium text-sm">
                      {user.email?.split('@')[0] || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer flex items-center gap-2"
                    onClick={handleSettingsClick}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer flex items-center gap-2 text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" asChild>
                <Link to="/login">Log In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
