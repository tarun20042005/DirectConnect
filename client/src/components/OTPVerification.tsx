import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, ShieldCheck } from "lucide-react";

const otpSendSchema = z.object({
  phone: z.string().regex(/^\+91\s\d{5}\s\d{5}$/, "Enter valid Indian phone number"),
});

const otpVerifySchema = z.object({
  code: z.string().length(6, "OTP must be 6 digits"),
});

type OTPSendForm = z.infer<typeof otpSendSchema>;
type OTPVerifyForm = z.infer<typeof otpVerifySchema>;

interface OTPVerificationProps {
  onVerified?: () => void;
  phone?: string;
}

export function OTPVerification({ onVerified, phone }: OTPVerificationProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [userPhone, setUserPhone] = useState(phone || "");
  const [otpExpiry, setOtpExpiry] = useState<Date | null>(null);

  const sendForm = useForm<OTPSendForm>({
    resolver: zodResolver(otpSendSchema),
    defaultValues: { phone: phone || "" },
  });

  const verifyForm = useForm<OTPVerifyForm>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { code: "" },
  });

  const handleSendOTP = async (data: OTPSendForm) => {
    setIsLoading(true);
    try {
      const response: any = await apiRequest("POST", "/api/otp/send", {
        phone: data.phone,
      });
      setUserPhone(data.phone);
      setOtpExpiry(new Date(response.expiresAt));
      setStep("verify");
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${data.phone}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (data: OTPVerifyForm) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/otp/verify", {
        code: data.code,
      });
      toast({
        title: "Success!",
        description: "Your phone number has been verified",
      });
      verifyForm.reset();
      setStep("phone");
      onVerified?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          Verify Phone Number
        </CardTitle>
        <CardDescription>
          Secure your account with phone verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "phone" ? (
          <Form {...sendForm}>
            <form onSubmit={sendForm.handleSubmit(handleSendOTP)} className="space-y-4">
              <FormField
                control={sendForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Phone className="h-10 w-10 text-muted-foreground flex-shrink-0" />
                        <Input
                          placeholder="+91 98765 43210"
                          {...field}
                          data-testid="input-otp-phone"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-send-otp"
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...verifyForm}>
            <form onSubmit={verifyForm.handleSubmit(handleVerifyOTP)} className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Enter the 6-digit code sent to {userPhone}
                {otpExpiry && (
                  <div className="text-xs mt-1">
                    Expires at {otpExpiry.toLocaleTimeString()}
                  </div>
                )}
              </div>

              <FormField
                control={verifyForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000000"
                        maxLength={6}
                        {...field}
                        data-testid="input-otp-code"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("phone")}
                  data-testid="button-back-to-phone"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                  data-testid="button-verify-otp"
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
