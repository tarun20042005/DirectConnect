import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PropertyComparison } from "@/components/PropertyComparison";
import { PropertyCard } from "@/components/PropertyCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import type { Property } from "@shared/schema";

export default function PropertyComparisonPage() {
  const [, setLocation] = useLocation();
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('comparisonProperties');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  useEffect(() => {
    localStorage.setItem('comparisonProperties', JSON.stringify(selectedIds));
  }, [selectedIds]);

  const selectedProperties = properties?.filter(p => selectedIds.includes(p.id)) || [];

  const toggleProperty = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeProperty = (id: string) => {
    setSelectedIds(selectedIds.filter(sid => sid !== id));
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/search")}
            className="mb-4"
            data-testid="button-back-to-search"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Select Properties</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Choose up to 3 properties to compare ({selectedIds.length}/3)
            </p>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </>
              ) : (
                properties?.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleProperty(property.id)}
                    data-testid={`checkbox-compare-${property.id}`}
                  >
                    <Checkbox
                      checked={selectedIds.includes(property.id)}
                      onCheckedChange={() => toggleProperty(property.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-2">{property.title}</p>
                      <p className="text-xs text-muted-foreground">₹{(parseInt(property.price) || 0).toLocaleString('en-IN')}/mo</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <PropertyComparison
              properties={selectedProperties}
              onRemove={removeProperty}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
