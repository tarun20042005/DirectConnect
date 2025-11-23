import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AdvancedFiltersProps {
  onFiltersChange: (filters: {
    petFriendly?: boolean;
    furnished?: boolean;
    amenities?: string[];
  }) => void;
}

const amenities = [
  { id: "parking", label: "Parking" },
  { id: "gym", label: "Gym" },
  { id: "pool", label: "Swimming Pool" },
  { id: "garden", label: "Garden" },
  { id: "balcony", label: "Balcony" },
  { id: "kitchen", label: "Modular Kitchen" },
  { id: "ac", label: "Air Conditioning" },
  { id: "water", label: "Water Supply" },
  { id: "power", label: "Backup Power" },
  { id: "security", label: "24/7 Security" },
];

export function AdvancedFilters({ onFiltersChange }: AdvancedFiltersProps) {
  const [petFriendly, setPetFriendly] = React.useState(false);
  const [furnished, setFurnished] = React.useState(false);
  const [selectedAmenities, setSelectedAmenities] = React.useState<string[]>([]);

  useEffect(() => {
    onFiltersChange({
      petFriendly,
      furnished,
      amenities: selectedAmenities,
    });
  }, [petFriendly, furnished, selectedAmenities, onFiltersChange]);

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((a) => a !== amenityId) : [...prev, amenityId]
    );
  };

  const handleClear = () => {
    setPetFriendly(false);
    setFurnished(false);
    setSelectedAmenities([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Advanced Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property Type */}
        <div className="space-y-3">
          <h3 className="font-semibold">Property Features</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="petFriendly"
                checked={petFriendly}
                onCheckedChange={(checked) => setPetFriendly(checked as boolean)}
                data-testid="checkbox-pet-friendly"
              />
              <Label htmlFor="petFriendly" className="cursor-pointer font-normal">
                Pet Friendly
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="furnished"
                checked={furnished}
                onCheckedChange={(checked) => setFurnished(checked as boolean)}
                data-testid="checkbox-furnished"
              />
              <Label htmlFor="furnished" className="cursor-pointer font-normal">
                Furnished
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Amenities */}
        <div className="space-y-3">
          <h3 className="font-semibold">Amenities</h3>
          <div className="grid grid-cols-2 gap-2">
            {amenities.map((amenity) => (
              <div key={amenity.id} className="flex items-center gap-2">
                <Checkbox
                  id={amenity.id}
                  checked={selectedAmenities.includes(amenity.id)}
                  onCheckedChange={() => toggleAmenity(amenity.id)}
                  data-testid={`checkbox-amenity-${amenity.id}`}
                />
                <Label htmlFor={amenity.id} className="cursor-pointer font-normal text-sm">
                  {amenity.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Clear Filters */}
        {(petFriendly || furnished || selectedAmenities.length > 0) && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleClear}
            data-testid="button-clear-filters"
          >
            Clear Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
