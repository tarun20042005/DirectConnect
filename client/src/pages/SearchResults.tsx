import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, Map, List } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyMap } from "@/components/PropertyMap";
import { Skeleton } from "@/components/ui/skeleton";
import type { Property } from "@shared/schema";

export default function SearchResults() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const amenitiesOptions = [
    "Parking",
    "WiFi",
    "Air Conditioning",
    "Heating",
    "Washer/Dryer",
    "Dishwasher",
    "Pet Friendly",
    "Gym",
  ];

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Price Range</Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={5000}
          step={100}
          className="mb-2"
          data-testid="slider-price-range"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Bedrooms</Label>
        <Select value={bedrooms} onValueChange={setBedrooms}>
          <SelectTrigger data-testid="select-bedrooms">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Bathrooms</Label>
        <Select value={bathrooms} onValueChange={setBathrooms}>
          <SelectTrigger data-testid="select-bathrooms">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Amenities</Label>
        {amenitiesOptions.map((amenity) => (
          <div key={amenity} className="flex items-center space-x-2">
            <Checkbox
              id={amenity}
              checked={selectedAmenities.includes(amenity)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedAmenities([...selectedAmenities, amenity]);
                } else {
                  setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                }
              }}
              data-testid={`checkbox-amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
            />
            <Label htmlFor={amenity} className="text-sm font-normal cursor-pointer">
              {amenity}
            </Label>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="verified"
          checked={verifiedOnly}
          onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
          data-testid="checkbox-verified-only"
        />
        <Label htmlFor="verified" className="text-sm font-normal cursor-pointer">
          Verified Owners Only
        </Label>
      </div>
    </div>
  );

  const filteredProperties = properties?.filter(property => {
    const price = parseFloat(property.price as string);
    if (price < priceRange[0] || price > priceRange[1]) return false;
    if (bedrooms && bedrooms !== "any" && property.bedrooms < parseInt(bedrooms)) return false;
    if (bathrooms && bathrooms !== "any" && property.bathrooms < parseInt(bathrooms)) return false;
    if (verifiedOnly && !property.verified) return false;
    if (selectedAmenities.length > 0) {
      const hasAllAmenities = selectedAmenities.every(a => 
        property.amenities?.includes(a)
      );
      if (!hasAllAmenities) return false;
    }
    return true;
  }) || [];

  return (
    <div className="min-h-[calc(100vh-theme(spacing.16))] md:min-h-[calc(100vh-theme(spacing.20))]">
      <div className="flex h-full">
        <div className="hidden lg:block w-80 border-r bg-muted/30 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-6">Filters</h2>
          <FilterPanel />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="border-b bg-background p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden" data-testid="button-filters">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterPanel />
                    </div>
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-muted-foreground">
                  {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  data-testid="button-view-list"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("map")}
                  data-testid="button-view-map"
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {viewMode === "list" ? (
              <div className="h-full overflow-y-auto p-4 md:p-6">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="aspect-video w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : filteredProperties.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-xl font-semibold mb-2">No properties found</p>
                    <p className="text-muted-foreground">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProperties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onClick={() => setLocation(`/property/${property.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Loading map...</p>
                  </div>
                ) : (
                  <PropertyMap
                    properties={filteredProperties}
                    selectedProperty={selectedProperty}
                    onPropertyClick={(property) => {
                      setSelectedProperty(property);
                      setLocation(`/property/${property.id}`);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
