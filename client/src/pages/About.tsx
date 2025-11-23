import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Shield, Zap } from "lucide-react";

export default function About() {
  const features = [
    {
      icon: Users,
      title: "Direct Connection",
      description: "Connect directly with property owners and tenants without middlemen or broker fees."
    },
    {
      icon: Target,
      title: "Transparent Pricing",
      description: "No hidden charges. All costs are clearly displayed upfront for complete transparency."
    },
    {
      icon: Shield,
      title: "Verified Users",
      description: "Owner verification system ensures you're dealing with legitimate, trustworthy landlords."
    },
    {
      icon: Zap,
      title: "Real-Time Communication",
      description: "Instant messaging and appointment scheduling for seamless property viewings."
    }
  ];

  const teamMembers = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      bio: "Real estate veteran with 10+ years of experience disrupting India's rental market."
    },
    {
      name: "Priya Singh",
      role: "Co-Founder & CTO",
      bio: "Full-stack technologist passionate about building scalable housing solutions."
    },
    {
      name: "Arjun Patel",
      role: "Operations Lead",
      description: "Ensures smooth platform operations and user satisfaction across all major Indian cities."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            About DirectConnect Rentals
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-8">
            Revolutionizing India's rental market by eliminating brokers and connecting owners directly with tenants.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 px-4 bg-card">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground mb-4">
            DirectConnect Rentals was founded to transform India's rental housing market. For too long, property seekers and owners have been forced to pay unnecessary broker fees, navigate opaque pricing, and deal with intermediaries who don't have their best interests at heart.
          </p>
          <p className="text-lg text-muted-foreground">
            We believe rental housing should be simple, transparent, and affordable. Our platform empowers property owners and tenants to connect directly, negotiate fairly, and build trust through verified profiles and real-time communication.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose DirectConnect?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} data-testid={`card-feature-${index}`}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Icon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                      <CardTitle>{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} data-testid={`card-team-member-${index}`}>
                <CardHeader>
                  <CardTitle>{member.name}</CardTitle>
                  <p className="text-sm text-primary font-semibold">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{member.bio || member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Home?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users who've already discovered a better way to rent.
          </p>
          <Link href="/">
            <Button size="lg" data-testid="button-start-searching">
              Start Searching Properties
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
