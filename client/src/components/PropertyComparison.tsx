import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Bed, Bath, Square, Zap } from "lucide-react";
import type { Property } from "@shared/schema";

interface PropertyComparisonProps {
  properties: Property[];
  onRemove?: (propertyId: string) => void;
  onClose?: () => void;
}

export function PropertyComparison({ properties, onRemove, onClose }: PropertyComparisonProps) {
  if (properties.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-2">No properties selected</p>
          <p className="text-sm text-muted-foreground">Select 2-3 properties to compare</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Compare Properties</h2>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} data-testid="button-close-comparison">
            Close
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${properties.length}, minmax(300px, 1fr))` }}>
          {properties.map((property) => (
            <Card key={property.id} className="flex flex-col" data-testid={`card-compare-${property.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-2 gap-1">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="line-clamp-1">{property.city}, {property.state}</span>
                    </div>
                  </div>
                  {onRemove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => onRemove(property.id)}
                      data-testid={`button-remove-${property.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {property.images && property.images[0] && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-3 border-t pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Rent/Month</p>
                    <p className="text-2xl font-bold text-primary">₹{(parseInt(property.price) || 0).toLocaleString('en-IN')}</p>
                  </div>

                  {property.deposit && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Deposit</p>
                      <p className="text-lg font-semibold">₹{(parseInt(property.deposit) || 0).toLocaleString('en-IN')}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 py-3 border-y">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Bedrooms</p>
                      <p className="text-xl font-bold flex items-center gap-1">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                        {property.bedrooms}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Bathrooms</p>
                      <p className="text-xl font-bold flex items-center gap-1">
                        <Bath className="h-4 w-4 text-muted-foreground" />
                        {property.bathrooms}
                      </p>
                    </div>
                  </div>

                  {property.sqft && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Square Feet</p>
                      <p className="text-lg font-semibold flex items-center gap-1">
                        <Square className="h-4 w-4 text-muted-foreground" />
                        {property.sqft} sqft
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Location</p>
                    <p className="text-sm">{property.address}</p>
                  </div>

                  {property.amenities && property.amenities.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-1.5">
                        {property.amenities.map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Zap className="h-2.5 w-2.5 mr-1" />
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {property.propertyType && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Type</p>
                      <Badge variant="outline">{property.propertyType}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Quick Comparison</h3>
        <div className="space-y-2 text-sm">
          <div className="grid gap-3" style={{ gridTemplateColumns: `1fr repeat(${properties.length}, 1fr)` }}>
            <div className="font-semibold">Feature</div>
            {properties.map((p) => (
              <div key={p.id} className="font-semibold text-xs line-clamp-2">
                {p.title}
              </div>
            ))}

            <div className="text-muted-foreground">Price</div>
            {properties.map((p) => (
              <div key={p.id} className="font-semibold text-primary">
                ₹{(parseInt(p.price) || 0).toLocaleString('en-IN')}
              </div>
            ))}

            <div className="text-muted-foreground">BHK</div>
            {properties.map((p) => (
              <div key={p.id} className="font-semibold">
                {p.bedrooms}B/{p.bathrooms}B
              </div>
            ))}

            <div className="text-muted-foreground">City</div>
            {properties.map((p) => (
              <div key={p.id} className="font-semibold">
                {p.city}
              </div>
            ))}

            <div className="text-muted-foreground">Amenities</div>
            {properties.map((p) => (
              <div key={p.id} className="text-xs">
                {p.amenities?.length || 0} included
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
