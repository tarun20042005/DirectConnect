import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Home, MessageSquare, Calendar, ShieldCheck, MapPin, Bed, Bath, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import heroImage from "@assets/generated_images/traditional_south_indian_style_house_with_red_tile_roof.png";
import type { Property } from "@shared/schema";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [searchLocation, setSearchLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");

  const { data: allProperties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation) params.set("location", searchLocation);
    if (propertyType) params.set("type", propertyType);
    setLocation(`/search?${params.toString()}`);
  };

  const features = [
    {
      icon: Home,
      title: "Direct Connection",
      description: "Connect directly with property owners without middlemen or broker fees"
    },
    {
      icon: MessageSquare,
      title: "Real-Time Chat",
      description: "Instant messaging with owners for quick responses and negotiations"
    },
    {
      icon: Calendar,
      title: "Easy Scheduling",
      description: "Book property viewings at your convenience with our calendar system"
    }
  ];

  const featuredProperties = (allProperties || []).slice(0, 4).map(prop => ({
    id: prop.id,
    image: (typeof prop.images === 'string' ? JSON.parse(prop.images) : prop.images)?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",
    title: prop.title,
    price: prop.price,
    location: `${prop.city}, ${prop.state}`,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    verified: true
  }));

  return (
    <div className="min-h-screen">
      <section 
        className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
            Find Your Perfect Home in India
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 md:mb-12 max-w-2xl mx-auto">
            Browse verified properties across India and connect directly with owners - no broker fees, no hidden charges
          </p>

          <Card className="max-w-3xl mx-auto backdrop-blur-md bg-background/95 shadow-xl">
            <CardContent className="p-4 md:p-6">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search cities - Bangalore, Chennai, Coimbatore, Tiruppur..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-location"
                  />
                </div>

                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-property-type">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                  </SelectContent>
                </Select>

                <Button type="submit" size="default" className="md:w-auto" data-testid="button-search">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Finding your next home has never been easier with DirectConnect
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate transition-all" data-testid={`card-feature-${index}`}>
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold mb-2">Featured Properties</h2>
              <p className="text-muted-foreground">Discover handpicked rentals from verified owners</p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/search")} data-testid="button-view-all">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <Card 
                key={property.id} 
                className="overflow-hidden hover-elevate cursor-pointer transition-all group"
                onClick={() => setLocation(`/property/${property.id}`)}
                data-testid={`card-property-${property.id}`}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  {property.verified && (
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur px-2 py-1 rounded-md flex items-center gap-1 text-xs font-medium">
                      <ShieldCheck className="h-3 w-3 text-primary" />
                      <span>Verified</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-md font-semibold">
                    ${property.price}/mo
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{property.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {property.bedrooms} bed
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      {property.bathrooms} bath
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Ready to Find Your Next Home?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of renters and owners who trust DirectConnect for hassle-free housing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setLocation("/search")}
              data-testid="button-cta-search"
            >
              <Search className="h-5 w-5 mr-2" />
              Browse Properties
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              onClick={() => setLocation("/list-property")}
              data-testid="button-cta-list"
            >
              <Home className="h-5 w-5 mr-2" />
              List Your Property
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
