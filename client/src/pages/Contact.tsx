import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to a backend service
    toast({
      title: "Message Received",
      description: "Thank you for contacting us. We'll get back to you soon!",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "support@directconnect.in",
      description: "We respond within 24 hours"
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+91-XXXX-XXXX-XXXX",
      description: "Monday - Friday, 9 AM - 6 PM IST"
    },
    {
      icon: MapPin,
      title: "Address",
      details: "Bangalore, India",
      description: "Multiple offices across major Indian cities"
    },
    {
      icon: Clock,
      title: "Response Time",
      details: "Within 24 hours",
      description: "Quick support for urgent issues"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Get In Touch
          </h1>
          <p className="text-xl text-muted-foreground text-center">
            Have questions about DirectConnect Rentals? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 px-4 bg-card">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <Card key={index} data-testid={`card-contact-${index}`}>
                  <CardHeader>
                    <Icon className="w-6 h-6 text-primary mb-2" />
                    <CardTitle className="text-lg">{info.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-foreground mb-2">{info.details}</p>
                    <p className="text-sm text-muted-foreground">{info.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card data-testid="card-contact-form">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium" htmlFor="name">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    data-testid="input-name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium" htmlFor="email">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium" htmlFor="subject">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="What is this about?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    data-testid="input-subject"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium" htmlFor="message">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us more..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="min-h-[150px]"
                    data-testid="textarea-message"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" data-testid="button-send-message">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <Card data-testid="card-faq-1">
              <CardHeader>
                <CardTitle className="text-lg">Is DirectConnect Rentals available in my city?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  DirectConnect Rentals is currently operational in major Indian cities including Bangalore, Mumbai, Delhi, Pune, and Hyderabad. We're expanding to new cities regularly.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-faq-2">
              <CardHeader>
                <CardTitle className="text-lg">How do I verify my account?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We offer OTP-based verification for owners. Simply provide your phone number during registration, and we'll send you a verification code.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-faq-3">
              <CardHeader>
                <CardTitle className="text-lg">Are there any fees for listing properties?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No! Listing properties on DirectConnect Rentals is completely free for owners. We don't charge any broker fees or hidden charges.
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-faq-4">
              <CardHeader>
                <CardTitle className="text-lg">How do I schedule a property viewing?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You can schedule a viewing directly through the property listing page. The owner will receive your request and confirm the appointment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
