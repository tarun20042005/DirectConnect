import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Heart, ShieldCheck, Trash2 } from "lucide-react";
import type { Property } from "@shared/schema";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getAuthUser } from "@/lib/auth";

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
  showDeleteSaved?: boolean;
}

export function PropertyCard({ property, onClick, showDeleteSaved }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = property.images || [];
  const { toast } = useToast();
  const user = getAuthUser();

  const { data: savedStatus } = useQuery<{ saved: boolean }>({
    queryKey: ["/api/saved-properties/check", property.id],
    enabled: !!user,
  });

  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/saved-properties/toggle", { propertyId: property.id });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-properties/check", property.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-properties"] });
      toast({
        title: data.saved ? "Property saved" : "Property removed",
        description: data.saved ? "You can find this in your saved properties." : "Property has been removed from your saved list.",
      });
    },
  });

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be logged in to save properties.", variant: "destructive" });
      return;
    }
    toggleSaveMutation.mutate();
  };

  const handleDeleteSaved = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveMutation.mutate();
  };

  return (
    <Card 
      className="overflow-hidden hover-elevate cursor-pointer transition-all group"
      onClick={onClick}
      data-testid={`card-property-${property.id}`}
    >
      <div className="aspect-video relative overflow-hidden bg-muted">
        {images.length > 0 && (
          <img
            src={images[currentImageIndex]}
            alt={property.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        )}

        <div className="absolute top-3 right-3 flex gap-2">
          {showDeleteSaved ? (
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8 shadow-lg z-10"
              onClick={handleDeleteSaved}
              disabled={toggleSaveMutation.isPending}
              data-testid={`button-delete-saved-${property.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : user && (
            <Button
              size="icon"
              variant="secondary"
              className={`h-8 w-8 shadow-lg transition-colors ${savedStatus?.saved ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'}`}
              onClick={handleSaveClick}
              disabled={toggleSaveMutation.isPending}
              data-testid={`button-save-${property.id}`}
            >
              <Heart className={`h-4 w-4 ${savedStatus?.saved ? 'fill-current' : ''}`} />
            </Button>
          )}
          {property.verified && (
            <div className="bg-background/90 backdrop-blur px-2 py-1 rounded-md flex items-center gap-1 text-xs font-medium">
              <ShieldCheck className="h-3 w-3 text-primary" />
              <span>Verified</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-3 left-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-semibold shadow-lg">
          ₹{property.price}/mo
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white w-4' : 'bg-white/60'
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

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{property.title}</h3>

        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{property.address}, {property.city}, {property.state}</span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4 text-muted-foreground" />
            <span>{property.bathrooms} bath</span>
          </div>
          {property.sqft && (
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4 text-muted-foreground" />
              <span>{property.sqft} sqft</span>
            </div>
          )}
        </div>

        {property.amenities && property.amenities.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{property.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
