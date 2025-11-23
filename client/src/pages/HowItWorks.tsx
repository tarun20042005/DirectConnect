import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, MessageSquare, Calendar, DollarSign, Shield } from "lucide-react";

export default function HowItWorks() {
  const ownerSteps = [
    {
      number: 1,
      title: "Create Your Account",
      description: "Sign up as a property owner with your email and phone number. It takes less than 2 minutes."
    },
    {
      number: 2,
      title: "List Your Property",
      description: "Add property details, upload high-quality photos, set rental price, and specify amenities."
    },
    {
      number: 3,
      title: "Manage Inquiries",
      description: "Receive tenant inquiries through the platform and respond directly using real-time chat."
    },
    {
      number: 4,
      title: "Schedule Viewings",
      description: "Coordinate viewing appointments with interested tenants using our built-in scheduler."
    },
    {
      number: 5,
      title: "Finalize Lease",
      description: "Complete rental agreement and get verified owner badge to build credibility."
    }
  ];

  const tenantSteps = [
    {
      number: 1,
      title: "Create Your Account",
      description: "Register as a tenant with basic information. You'll instantly get access to all listings."
    },
    {
      number: 2,
      title: "Search Properties",
      description: "Browse properties by city, price range, bedrooms, and amenities. Use interactive maps to explore neighborhoods."
    },
    {
      number: 3,
      title: "Chat with Owners",
      description: "Message property owners directly to ask questions, negotiate terms, and get quick responses."
    },
    {
      number: 4,
      title: "Schedule Viewing",
      description: "Book viewing appointments at your convenience. Owners confirm and provide directions."
    },
    {
      number: 5,
      title: "Move In",
      description: "After agreement, complete rental terms and move into your new home. No broker involved!"
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Save Money",
      description: "No broker fees. Save up to 10% on rental costs by connecting directly with owners."
    },
    {
      icon: Users,
      title: "Direct Connection",
      description: "Talk directly to property owners. No intermediaries means faster decisions and better negotiations."
    },
    {
      icon: MessageSquare,
      title: "Real-Time Communication",
      description: "Instant messaging with owners. Get questions answered immediately without waiting for brokers."
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "View properties when it suits you. Schedule viewings at your convenience with instant confirmation."
    },
    {
      icon: Shield,
      title: "Verified Owners",
      description: "All owners are verified through OTP and phone authentication. Rent with confidence."
    },
    {
      icon: CheckCircle,
      title: "Transparent Pricing",
      description: "All costs are clear upfront. No hidden charges or surprise fees from brokers."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            How DirectConnect Works
          </h1>
          <p className="text-xl text-center opacity-90">
            A simple, transparent way to connect property owners and tenants without broker fees.
          </p>
        </div>
      </section>

      {/* For Owners */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">For Property Owners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {ownerSteps.map((step) => (
              <Card key={step.number} data-testid={`card-owner-step-${step.number}`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl font-bold text-primary">{step.number}</CardTitle>
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold text-lg">{step.title}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Tenants */}
      <section className="py-16 md:py-24 px-4 bg-card">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">For Tenants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {tenantSteps.map((step) => (
              <Card key={step.number} data-testid={`card-tenant-step-${step.number}`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl font-bold text-primary">{step.number}</CardTitle>
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold text-lg">{step.title}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Why Choose DirectConnect?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} data-testid={`card-benefit-${index}`}>
                  <CardHeader>
                    <Icon className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of property owners and tenants already using DirectConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" variant="secondary" data-testid="button-get-started">
                Get Started Now
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" data-testid="button-browse">
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
