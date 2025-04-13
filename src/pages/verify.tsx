
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state (passed from registration)
    const stateEmail = location.state?.email;
    if (stateEmail) {
      console.log("Email found in location state:", stateEmail);
      setEmail(stateEmail);
    }
  }, [location]);

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });
      
      if (error) throw error;
      
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified.",
      });
      
      navigate("/login", { 
        replace: true,
        state: { verified: true }
      });
    } catch (error: any) {
      console.error("Verification error:", error);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message || "Please try again with a valid code.",
      });
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please provide the email address you registered with.",
        variant: "destructive",
      });
      return;
    }
    
    if (otp.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter all 6 digits of your verification code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await verifyOtp(email, otp);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please provide the email address you registered with.",
        variant: "destructive",
      });
      return;
    }
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) throw error;
      
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      console.error("Error resending OTP:", error);
      toast({
        title: "Failed to resend code",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-primary-700 mb-2">
          Doyence Estimating
        </h1>
        <h2 className="text-center text-xl font-semibold text-gray-900">
          Verify your email
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <div className="mx-auto h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary-600" />
            </div>
            <CardTitle className="text-center">Verification required</CardTitle>
            <CardDescription className="text-center">
              We've sent a 6-digit verification code to
              {email && <span className="font-medium"> {email}</span>}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleVerify}>
            <CardContent>
              {!email && (
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Your email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full rounded-md border border-input px-3 py-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification code
                </label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              
              <div className="text-sm text-center mt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:underline transition ease-in-out duration-150"
                  disabled={isResending}
                >
                  {isResending ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Didn't receive a code? Resend"
                  )}
                </button>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || isLoading || otp.length !== 6}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Verify Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Verify;
