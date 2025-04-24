
import React from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/useAuth';
import { ExtendedUser } from '@/contexts/auth-types';

export default function ImpersonationBanner() {
  const { user, profile, endImpersonation } = useAuth();

  // Check if the user is being impersonated
  if (!user?.impersonated) {
    return null;
  }

  return (
    <div className="bg-amber-500 text-white py-2 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-medium">
          You are impersonating {profile?.first_name || ''} {profile?.last_name || ''}
        </span>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-transparent border-white text-white hover:bg-amber-600 hover:text-white"
        onClick={() => endImpersonation()}
      >
        <LogOut className="h-4 w-4 mr-2" />
        End impersonation
      </Button>
    </div>
  );
}
