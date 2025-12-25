import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Home, Shield, DollarSign, Users, CheckCircle, ArrowRight } from "lucide-react";
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
  const [isSignup, setIsSignup] = useState(false);

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

  const handleSignup = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const formattedData = {
        ...data,
        phone: data.phone ? formatIndianPhone(data.phone) : undefined,
      };
      const response = await apiRequest<any>("POST", "/api/auth/signup", formattedData);
      saveAuthUser(response);
      toast({ title: "Welcome!", description: "Your account has been created successfully." });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A1628] text-white p-12 flex-col justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#1E3A5F] to-[#0A1628] opacity-90" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Home className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">DirectConnect</h1>
          </div>
          
          <h2 className="text-5xl font-bold mb-6 leading-tight tracking-tight">
            Find Your Dream Home in South India
          </h2>
          
          <p className="text-lg text-slate-300 mb-12 max-w-md">
            Connect directly with property owners in Chennai, Coimbatore, Tiruppur & Bangalore. No middlemen, no brokerage.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <Shield className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="text-lg text-slate-200">Verified property owners & tenants</span>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="text-lg text-slate-200">Zero brokerage fees</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 pt-12 border-t border-white/10">
          <p className="text-sm text-slate-400">© 2025 DirectConnect Rentals. Professional Housing Platform.</p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h3 className="text-3xl font-bold mb-2">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h3>
            <p className="text-muted-foreground">
              {isSignup 
                ? "Join thousands finding homes without brokers" 
                : "Sign in to access your dashboard"}
            </p>
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-2 mb-8 bg-muted/50 p-1 rounded-lg">
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 px-4 rounded font-medium transition ${
                !isSignup
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-login"
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2 px-4 rounded font-medium transition ${
                isSignup
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-signup"
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {!isSignup && (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="h-11"
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
                          className="h-11"
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
                  className="w-full h-11 text-base"
                  disabled={isLoading}
                  data-testid="button-login-submit"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </div>
              </form>
            </Form>
          )}

          {/* Signup Form */}
          {isSignup && (
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-5">
                <FormField
                  control={signupForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          className="h-11"
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="h-11"
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+91 98765 43210"
                          className="h-11"
                          data-testid="input-signup-phone"
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
                          className="h-11"
                          data-testid="input-signup-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      {passwordValue && (
                        <div className="space-y-2 text-sm">
                          {passwordValidation.checks.length > 0 && (
                            <div className="space-y-1">
                              {passwordValidation.checks.map((check, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2"
                                >
                                  {check.passed ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <div className="h-4 w-4 rounded-full border border-gray-300" />
                                  )}
                                  <span
                                    className={
                                      check.passed
                                        ? "text-green-600"
                                        : "text-muted-foreground"
                                    }
                                  >
                                    {check.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I am looking to</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Label
                                htmlFor="tenant"
                                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted transition"
                                data-testid="label-tenant"
                              >
                                <RadioGroupItem value="tenant" id="tenant" />
                                <div>
                                  <div className="font-medium">Rent a Home</div>
                                  <div className="text-sm text-muted-foreground">
                                    Find properties
                                  </div>
                                </div>
                              </Label>
                            </div>
                            <div className="flex-1">
                              <Label
                                htmlFor="owner"
                                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted transition"
                                data-testid="label-owner"
                              >
                                <RadioGroupItem value="owner" id="owner" />
                                <div>
                                  <div className="font-medium">List Property</div>
                                  <div className="text-sm text-muted-foreground">
                                    I'm an owner
                                  </div>
                                </div>
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 text-base"
                  disabled={isLoading}
                  data-testid="button-signup-submit"
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
