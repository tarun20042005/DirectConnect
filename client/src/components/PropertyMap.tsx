import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface PropertyMapProps {
  embedCode?: string | null;
  address?: string;
}

export function PropertyMap({ embedCode, address }: PropertyMapProps) {
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
