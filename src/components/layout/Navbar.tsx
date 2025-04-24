
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
import { Menu, LogOut, Settings, Shield } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

const Navbar = ({ onMobileMenuToggle }: NavbarProps) => {
  const { user, profile, signOut, isAdmin, isSuperuser } = useAuth();
  const { themeColor } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    // Navigation is handled in the AuthContext
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };
  
  const handleAdminClick = () => {
    navigate("/admin");
  };

  // Don't show admin controls if user is being impersonated
  const showAdminControls = (isAdmin || isSuperuser) && !user?.impersonated;

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
              <span 
                className="text-xl font-montserrat font-bold"
                style={{ color: themeColor }}
              >
                Doyence Estimating
              </span>
            </Link>
          </div>

          {/* Right section - User menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Admin Dashboard Link (only for admins/superusers who aren't impersonating) */}
                {showAdminControls && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex items-center gap-2"
                    onClick={handleAdminClick}
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 hover:bg-gray-100 rounded-full px-3 py-2"
                    >
                      <Avatar className="h-8 w-8">
                        {profile?.profile_photo_url ? (
                          <AvatarImage src={profile.profile_photo_url} alt="Profile" />
                        ) : (
                          <AvatarFallback style={{ backgroundColor: themeColor + '20', color: themeColor }}>
                            {profile?.first_name?.charAt(0) ?? user.email?.charAt(0) ?? "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="hidden sm:inline-block font-medium text-sm">
                        {profile?.first_name
                          ? `${profile.first_name}${profile.last_name ? " " + profile.last_name : ""}`
                          : user.email?.split('@')[0] || "User"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium">
                        {profile?.email || user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    {/* Show Admin link in dropdown for mobile only when not impersonating */}
                    {showAdminControls && (
                      <>
                        <DropdownMenuItem 
                          className="cursor-pointer flex items-center gap-2 sm:hidden"
                          onClick={handleAdminClick}
                        >
                          <Shield className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="sm:hidden" />
                      </>
                    )}
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
              </>
            ) : (
              <Button 
                size="sm" 
                asChild
                style={{ backgroundColor: themeColor }}
              >
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
