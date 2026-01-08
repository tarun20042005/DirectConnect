import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Bed, Bath, Square, ShieldCheck, MessageSquare, Calendar, Heart, Share2, Eye, ChevronLeft, ChevronRight, X, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyMap } from "@/components/PropertyMap";
import { VerificationBadge } from "@/components/VerificationBadge";
import { PropertyReviews } from "@/components/PropertyReviews";
import type { Property, User } from "@shared/schema";
import { getAuthUser, isOwner } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PropertyDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const { toast } = useToast();
  const user = getAuthUser();

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["/api/properties", id],
  });

  const { data: owner } = useQuery<User>({
    queryKey: ["/api/users", property?.ownerId],
    enabled: !!property?.ownerId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <Skeleton className="aspect-video w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Property not found</h1>
        <Button onClick={() => setLocation("/search")}>Back to Search</Button>
      </div>
    );
  }

  const images = property.images || [];
  const amenities = property.amenities || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const ownerInitials = owner?.fullName
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase() || "O";

  // Check if current user is the property owner
  const isPropertyOwner = user && property && user.id === property.ownerId;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-6xl">
        <div className="mb-6">
          {images.length > 0 && (
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              <img
                src={images[currentImageIndex]}
                alt={property.title}
                className="object-cover w-full h-full cursor-pointer"
                onClick={() => setShowLightbox(true)}
                data-testid="image-property-main"
              />

              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 shadow-lg"
                    onClick={prevImage}
                    data-testid="button-prev-image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 shadow-lg"
                    onClick={nextImage}
                    data-testid="button-next-image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-background/80 backdrop-blur px-3 py-2 rounded-lg">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-primary w-6' : 'bg-muted-foreground'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold">{property.title}</h1>
                    {owner?.verified && (
                      <Badge variant="secondary" className="gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Verified Owner
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" data-testid="button-share">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-6 text-lg mb-4">
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">{property.bedrooms}</span>
                  <span className="text-muted-foreground">Bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">{property.bathrooms}</span>
                  <span className="text-muted-foreground">Bathrooms</span>
                </div>
                {property.sqft && (
                  <div className="flex items-center gap-2">
                    <Square className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{property.sqft}</span>
                    <span className="text-muted-foreground">sqft</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{property.views || 0} views</span>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {property.description}
              </p>
            </div>

            <Separator />

            {amenities.length > 0 && (
              <>
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="justify-center py-2">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            <div>
              <h2 className="text-2xl font-semibold mb-4">Location</h2>
              {property.googleMapsEmbed ? (
                <div 
                  className="h-96 rounded-lg overflow-hidden border"
                  dangerouslySetInnerHTML={{ __html: property.googleMapsEmbed }}
                />
              ) : (
                <PropertyMap embedCode={property.googleMapsEmbed} address={property.address} />
              )}
            </div>

            <Separator />

            <PropertyReviews propertyId={property.id} />
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">
                  ₹{property.price}<span className="text-base font-normal text-muted-foreground">/month</span>
                </CardTitle>
                {property.deposit && (
                  <p className="text-sm text-muted-foreground">
                    Deposit: ₹{property.deposit}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {owner && (
                  <a href={`/user/${owner.id}`} className="block hover-elevate">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Avatar>
                        <AvatarImage src={owner.avatarUrl || undefined} />
                        <AvatarFallback>{ownerInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{owner.fullName}</p>
                          <VerificationBadge verified={owner.verified || false} size="sm" />
                        </div>
                        <p className="text-sm text-muted-foreground">Property Owner</p>
                      </div>
                    </div>
                  </a>
                )}

                {isPropertyOwner ? (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => setLocation(`/edit-property/${property.id}`)}
                    data-testid="button-edit-property"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Property
                  </Button>
                ) : user ? (
                  <>
                    {property.deposit && (
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => setLocation(`/deposit/${property.id}`)}
                        data-testid="button-pay-deposit"
                      >
                        Pay Deposit ₹{(parseInt(property.deposit) || 0).toLocaleString('en-IN')}
                      </Button>
                    )}
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => setLocation(`/chat/${property.id}`)}
                      data-testid="button-contact-owner"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Owner
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                      onClick={() => setLocation(`/schedule/${property.id}`)}
                      data-testid="button-schedule-viewing"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Viewing
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => setLocation("/auth")}
                    data-testid="button-signin-to-contact"
                  >
                    Sign in to Contact
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setShowLightbox(false)}
            data-testid="button-close-lightbox"
          >
            <X className="h-6 w-6" />
          </Button>

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-white hover:bg-white/20"
                onClick={prevImage}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-white hover:bg-white/20"
                onClick={nextImage}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          <img
            src={images[currentImageIndex]}
            alt={property.title}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </div>
  );
}
