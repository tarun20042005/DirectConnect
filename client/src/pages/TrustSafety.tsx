import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, AlertCircle, Phone, Mail, Lock, Eye } from "lucide-react";

export default function TrustSafety() {
  const safetyMeasures = [
    {
      icon: Lock,
      title: "Verified Owners",
      description: "All property owners must complete OTP verification via phone and email to ensure legitimacy and trustworthiness."
    },
    {
      icon: Eye,
      title: "Photo Verification",
      description: "Property images are verified to ensure they match actual listings. We check for fake or misleading photos."
    },
    {
      icon: Shield,
      title: "Secure Messaging",
      description: "All communications between tenants and owners happen through our encrypted platform. No phone numbers are shared initially."
    },
    {
      icon: CheckCircle,
      title: "Verified Badges",
      description: "Owners with verified accounts display a 'Verified Owner' badge. This builds trust and shows commitment to legitimate business."
    },
    {
      icon: AlertCircle,
      title: "Report & Block",
      description: "Users can report suspicious accounts, fake listings, or inappropriate behavior. Our team investigates within 24 hours."
    },
    {
      icon: Mail,
      title: "Complaint Resolution",
      description: "If you have disputes with a property owner, we provide mediation and resolution support through our trust team."
    }
  ];

  const userResponsibilities = [
    {
      title: "Share Information Safely",
      description: "Don't share your full address or personal financial details before verifying the property and owner."
    },
    {
      title: "Meet in Person",
      description: "Always visit the property in person and verify it matches the listing photos before making any commitment."
    },
    {
      title: "Use Platform Messaging",
      description: "Keep all communication through DirectConnect. Avoid giving your phone number to unverified owners."
    },
    {
      title: "Check Ownership",
      description: "Verify that the person showing the property is the actual owner or authorized representative."
    },
    {
      title: "Read Reviews",
      description: "Check reviews from previous tenants to understand the owner's reputation and property condition."
    },
    {
      title: "Get Written Agreements",
      description: "Ensure all rental terms, price, and conditions are documented in writing before moving in."
    }
  ];

  const redFlags = [
    "Owner asks for payment before property viewing",
    "Listed price is significantly lower than market rate",
    "Photos look professional but differ from actual property",
    "Owner refuses to provide property address until payment",
    "Owner pressures you to decide immediately",
    "Listing has spelling errors or poor grammar throughout",
    "Owner asks for advance rent or deposits through untraceable methods",
    "No willingness to sign formal rental agreement",
    "Owner unavailable for multiple viewing appointments",
    "Property owner has no verifiable identity or reviews"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8" />
            <h1 className="text-4xl md:text-5xl font-bold">Trust & Safety</h1>
          </div>
          <p className="text-xl text-center opacity-90">
            Your safety is our priority. Learn how we verify users and protect both tenants and property owners.
          </p>
        </div>
      </section>

      {/* Safety Measures */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Our Safety Measures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safetyMeasures.map((measure, index) => {
              const Icon = measure.icon;
              return (
                <Card key={index} data-testid={`card-safety-measure-${index}`}>
                  <CardHeader>
                    <Icon className="w-8 h-8 text-primary mb-2" />
                    <CardTitle>{measure.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{measure.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* User Responsibilities */}
      <section className="py-16 md:py-24 px-4 bg-card">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Your Responsibilities</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            While we provide safety tools, users must also take responsibility for their own security.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userResponsibilities.map((item, index) => (
              <Card key={index} data-testid={`card-responsibility-${index}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Red Flags */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Red Flags to Watch Out For</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            If you encounter any of these warning signs, the listing may be fraudulent. Don't proceed.
          </p>
          <Card className="bg-destructive/5 border-destructive/20" data-testid="card-red-flags">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {redFlags.map((flag, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">{flag}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Report Abuse */}
      <section className="py-16 md:py-24 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Found Something Suspicious?</h2>
          <p className="text-lg opacity-90 mb-8">
            Report fraudulent listings, fake owners, or suspicious activity to our trust & safety team immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:safety@directconnect.in">
              <Button size="lg" variant="secondary" className="gap-2" data-testid="button-report-email">
                <Mail className="w-5 h-5" />
                Report by Email
              </Button>
            </a>
            <a href="tel:+919876543210">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary gap-2" data-testid="button-report-phone">
                <Phone className="w-5 h-5" />
                Call Us
              </Button>
            </a>
          </div>
          <p className="text-sm opacity-75 mt-6">Response within 24 hours guaranteed</p>
        </div>
      </section>

      {/* Legal Section */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Important Legal Information</h2>
          <div className="space-y-6 text-muted-foreground">
            <p>
              <strong className="text-foreground">Disclaimer:</strong> DirectConnect Rentals is a platform that facilitates connections between property owners and tenants. While we implement safety measures, we are not responsible for disputes between users or any losses incurred due to fraudulent activity.
            </p>
            <p>
              <strong className="text-foreground">Verification:</strong> Verified owner badges indicate that a user has completed OTP verification. This does not guarantee the legitimacy of the property listing or the owner's trustworthiness. Users should conduct their own due diligence.
            </p>
            <p>
              <strong className="text-foreground">Liability:</strong> Users use DirectConnect at their own risk. We recommend property viewings, identity verification, and legal rental agreements before entering into any rental transaction.
            </p>
            <p>
              <strong className="text-foreground">Reporting:</strong> Suspected fraud should be reported immediately to safety@directconnect.in. We investigate all reports and take appropriate action against violators, including account suspension and legal action where applicable.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
