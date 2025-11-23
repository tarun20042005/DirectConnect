import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Property } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function DepositPayment() {
  const { propertyId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cardDetails, setCardDetails] = useState({
    name: "",
    email: "",
    cardNumber: "",
    expiry: "",
    cvc: ""
  });
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["/api/properties", propertyId],
  });

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/payments/deposit", {
        propertyId,
        amount: parseFloat(property?.deposit || "0"),
        tenantDetails: cardDetails
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setPaymentStatus("success");
      toast({
        title: "Payment Successful",
        description: `Deposit of ₹${property?.deposit} paid successfully!`,
      });
      setTimeout(() => setLocation(`/property/${propertyId}`), 2000);
    },
    onError: (error: any) => {
      setPaymentStatus("error");
      toast({
        title: "Payment Failed",
        description: error.message || "Could not process payment",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-2xl">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Property not found</h1>
        <Button onClick={() => setLocation("/")} data-testid="button-back-home">Back to Home</Button>
      </div>
    );
  }

  const deposit = parseFloat(property.deposit || "0");

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-2xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation(`/property/${propertyId}`)}
            className="mb-4"
            data-testid="button-back-property"
          >
            ← Back to Property
          </Button>
          <h1 className="text-3xl font-bold mb-2">Pay Deposit</h1>
          <p className="text-muted-foreground">{property.title}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2" data-testid="card-payment-form">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {paymentStatus === "success" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                  <p className="text-muted-foreground mb-4">
                    Your deposit of ₹{deposit.toLocaleString()} has been processed.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting you back to the property...
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium" htmlFor="name">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        disabled={paymentStatus === "processing"}
                        data-testid="input-card-name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium" htmlFor="email">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={cardDetails.email}
                        onChange={(e) => setCardDetails({ ...cardDetails, email: e.target.value })}
                        disabled={paymentStatus === "processing"}
                        data-testid="input-card-email"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium" htmlFor="card">
                        Card Number
                      </label>
                      <Input
                        id="card"
                        placeholder="4242 4242 4242 4242"
                        value={cardDetails.cardNumber}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                        disabled={paymentStatus === "processing"}
                        data-testid="input-card-number"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium" htmlFor="expiry">
                          Expiry Date
                        </label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          disabled={paymentStatus === "processing"}
                          data-testid="input-card-expiry"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium" htmlFor="cvc">
                          CVC
                        </label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          value={cardDetails.cvc}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                          disabled={paymentStatus === "processing"}
                          data-testid="input-card-cvc"
                        />
                      </div>
                    </div>
                  </div>

                  {paymentStatus === "error" && (
                    <div className="flex gap-2 p-4 bg-destructive/10 rounded-md">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                      <div className="text-sm text-destructive">
                        Payment failed. Please check your details and try again.
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => paymentMutation.mutate()}
                    disabled={paymentStatus === "processing" || !cardDetails.name || !cardDetails.email || !cardDetails.cardNumber}
                    className="w-full"
                    data-testid="button-process-payment"
                  >
                    {paymentStatus === "processing" ? "Processing..." : `Pay Deposit ₹${deposit.toLocaleString()}`}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    Secured by Stripe. Your data is encrypted.
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card data-testid="card-deposit-summary">
              <CardHeader>
                <CardTitle className="text-lg">Deposit Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Rent</span>
                  <span className="font-semibold">₹{property.price}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-3">
                  <span className="text-muted-foreground">Deposit Amount</span>
                  <span className="font-semibold text-primary">₹{deposit.toLocaleString()}</span>
                </div>
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  This is a secure deposit that will be held and returned after lease completion.
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-payment-info">
              <CardHeader>
                <CardTitle className="text-lg">Test Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div>
                  <p className="font-semibold">Card Number</p>
                  <p className="text-muted-foreground font-mono">4242 4242 4242 4242</p>
                </div>
                <div>
                  <p className="font-semibold">Expiry</p>
                  <p className="text-muted-foreground font-mono">12/25</p>
                </div>
                <div>
                  <p className="font-semibold">CVC</p>
                  <p className="text-muted-foreground font-mono">123</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
