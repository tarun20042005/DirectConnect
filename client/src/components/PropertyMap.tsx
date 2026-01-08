import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { Property } from "@shared/schema";

interface PropertyMapProps {
  embedCode?: string | null;
  address?: string;
  properties?: Property[];
  onPropertyClick?: (property: Property) => void;
}

export function PropertyMap({ embedCode, address, properties, onPropertyClick }: PropertyMapProps) {
  if (properties && onPropertyClick) {
    return (
      <Card className="w-full h-full flex flex-col items-center justify-center bg-muted/30">
        <MapPin className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Map view is being enhanced. Please use the list view for now.</p>
      </Card>
    );
  }

  if (!embedCode) {
    return (
      <Card className="w-full h-[400px] flex flex-col items-center justify-center bg-muted/30 border-dashed border-2">
        <MapPin className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center px-6">
          Location map not available for this property.<br />
          {address && <span className="text-sm">Address: {address}</span>}
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[400px] overflow-hidden">
      <div 
        className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
    </Card>
  );
}
