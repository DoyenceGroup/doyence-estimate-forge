
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
import { Mail, ArrowRight, Loader2, Clock } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const OTP_TIMEOUT = 180; // 3 minutes in seconds

const Verify = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(OTP_TIMEOUT);
  const [timerActive, setTimerActive] = useState(false);
  const { verifyOtp, resendOtp, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Start or reset the timer
  const startTimer = useCallback(() => {
    setTimeLeft(OTP_TIMEOUT);
    setTimerActive(true);
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    let interval: number | undefined;
    
    if (timerActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      toast({
        title: "OTP expired",
        description: "The verification code has expired. Please request a new one.",
        variant: "destructive",
      });
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft, toast]);

  // Get email from location state
  useEffect(() => {
    const stateEmail = location.state?.email;
    if (stateEmail) {
      console.log("Email found in location state:", stateEmail);
      setEmail(stateEmail);
      startTimer(); // Start timer when email is set
    }
  }, [location, startTimer]);

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
    
    if (!timerActive || timeLeft === 0) {
      toast({
        title: "OTP expired",
        description: "This verification code has expired. Please request a new one.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await verifyOtp(email, otp);
      // Navigation is handled in the AuthContext
    } catch (error) {
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
      await resendOtp(email);
      startTimer(); // Restart the timer after resending
    } catch (error) {
      console.error("Error resending OTP:", error);
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
              
              {timerActive && (
                <div className="flex justify-center items-center gap-2 text-sm text-amber-600 my-2">
                  <Clock className="h-4 w-4" />
                  <span>Code expires in: {formatTime(timeLeft)}</span>
                </div>
              )}
              
              <div className="text-sm text-center mt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending || (timerActive && timeLeft > OTP_TIMEOUT - 30)} // Prevent spam clicking
                  className={`font-medium focus:outline-none focus:underline transition ease-in-out duration-150 ${
                    isResending || (timerActive && timeLeft > OTP_TIMEOUT - 30)
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-primary-600 hover:text-primary-500"
                  }`}
                >
                  {isResending ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : timerActive && timeLeft > OTP_TIMEOUT - 30 ? (
                    `Wait ${OTP_TIMEOUT - 30 - timeLeft}s before resending`
                  ) : (
                    "Didn't receive a code? Resend"
                  )}
                </button>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || isLoading || otp.length !== 6 || !timerActive}
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
              
              <div className="text-sm text-center">
                <Link
                  to="/login"
                  className="text-primary-600 hover:underline font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Verify;
