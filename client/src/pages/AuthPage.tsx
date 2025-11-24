import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Home, User as UserIcon, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveAuthUser } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isValidIndianPhone, formatIndianPhone } from "@/lib/phone";
import { validatePasswordStrength } from "@/lib/password";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().refine(
    (password) => validatePasswordStrength(password).isValid,
    "Password must be at least 8 characters with uppercase, lowercase, and special character"
  ),
  phone: z.string().min(1, "Phone number is required").refine(
    (phone) => isValidIndianPhone(phone),
    "Please enter a valid 10-digit Indian phone number"
  ),
  role: z.enum(["tenant", "owner"]),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [signupStep, setSignupStep] = useState<"form" | "otp">("form");
  const [otpCode, setOtpCode] = useState("");
  const [pendingSignupData, setPendingSignupData] = useState<any>(null);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      role: "tenant",
    },
  });

  const passwordValue = signupForm.watch("password");
  const passwordValidation = validatePasswordStrength(passwordValue || "");

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<any>("POST", "/api/auth/login", data);
      saveAuthUser(response);
      toast({ title: "Welcome back!", description: "You've successfully logged in." });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupInitiate = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      // Format phone number to standard Indian format
      const formattedData = {
        ...data,
        phone: data.phone ? formatIndianPhone(data.phone) : undefined,
      };

      // Call signup initiate to send OTP
      await apiRequest<any>("POST", "/api/auth/signup-initiate", formattedData);
      
      // Store data for verification and move to OTP step
      setPendingSignupData(formattedData);
      setSignupStep("otp");
      setOtpCode("");
      
      toast({ title: "OTP Sent!", description: `OTP has been sent to ${formattedData.phone}. Check console for OTP (development mode).` });
    } catch (error: any) {
      toast({
        title: "Signup initiation failed",
        description: error.message || "Could not send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupVerifyOtp = async () => {
    if (!otpCode || !pendingSignupData) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest<any>("POST", "/api/auth/signup-verify", {
        ...pendingSignupData,
        otpCode,
      });
      saveAuthUser(response);
      toast({ title: "Welcome!", description: "Your account has been created successfully." });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "OTP verification failed",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-theme(spacing.16))] md:min-h-[calc(100vh-theme(spacing.20))] flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Home className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to DirectConnect</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            data-testid="input-login-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            data-testid="input-login-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    data-testid="button-login-submit"
                  >
                    {isLoading ? "Logging in..." : "Log In"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="signup">
              {signupStep === "form" ? (
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignupInitiate)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            data-testid="input-signup-fullname"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            data-testid="input-signup-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            data-testid="input-signup-password"
                            {...field}
                          />
                        </FormControl>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            {passwordValidation.hasMinLength ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                            <span className={passwordValidation.hasMinLength ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                              At least 8 characters
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {passwordValidation.hasUppercase ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                            <span className={passwordValidation.hasUppercase ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                              One uppercase letter (A-Z)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {passwordValidation.hasLowercase ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                            <span className={passwordValidation.hasLowercase ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                              One lowercase letter (a-z)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {passwordValidation.hasSpecialChar ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                            <span className={passwordValidation.hasSpecialChar ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                              One special character (!@#$%^&*)
                            </span>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number <span className="text-red-600">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+91 98765 43210"
                            data-testid="input-signup-phone"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">Enter 10-digit Indian phone number</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>I am a</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <div className="flex items-center space-x-3 space-y-0">
                              <RadioGroupItem value="tenant" id="tenant" data-testid="radio-role-tenant" />
                              <Label htmlFor="tenant" className="font-normal cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-4 w-4" />
                                  <span>Tenant - Looking for a rental</span>
                                </div>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 space-y-0">
                              <RadioGroupItem value="owner" id="owner" data-testid="radio-role-owner" />
                              <Label htmlFor="owner" className="font-normal cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <Home className="h-4 w-4" />
                                  <span>Owner - I have a property to rent</span>
                                </div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    data-testid="button-signup-submit"
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              </Form>
              ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Verify Phone Number</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter the 6-digit OTP sent to {pendingSignupData?.phone}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">OTP Code</label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.slice(0, 6))}
                    maxLength={6}
                    data-testid="input-otp-code"
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
                <Button
                  onClick={handleSignupVerifyOtp}
                  className="w-full"
                  disabled={isLoading || otpCode.length !== 6}
                  data-testid="button-verify-otp"
                >
                  {isLoading ? "Verifying..." : "Verify & Create Account"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSignupStep("form");
                    setPendingSignupData(null);
                    setOtpCode("");
                  }}
                  className="w-full"
                  data-testid="button-back-to-signup"
                >
                  Back to Sign Up
                </Button>
              </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
