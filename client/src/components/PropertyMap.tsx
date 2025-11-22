import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Property } from "@shared/schema";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertyClick?: (property: Property) => void;
  center?: [number, number];
  zoom?: number;
}

export function PropertyMap({
  properties,
  selectedProperty,
  onPropertyClick,
  center = [40.7128, -74.0060],
  zoom = 12,
}: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(center, zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) return;

      const lat = typeof property.latitude === 'string' ? parseFloat(property.latitude) : property.latitude;
      const lng = typeof property.longitude === 'string' ? parseFloat(property.longitude) : property.longitude;

      const priceIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div class="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold shadow-lg whitespace-nowrap" style="transform: translate(-50%, -100%);">
            $${property.price}/mo
          </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 30],
      });

      const marker = L.marker([lat, lng], { icon: priceIcon })
        .addTo(mapRef.current!);

      if (onPropertyClick) {
        marker.on("click", () => onPropertyClick(property));
      }

      markersRef.current.push(marker);
    });

    if (properties.length > 0) {
      const bounds = L.latLngBounds(
        properties
          .filter(p => p.latitude && p.longitude)
          .map(p => {
            const lat = typeof p.latitude === 'string' ? parseFloat(p.latitude) : p.latitude;
            const lng = typeof p.longitude === 'string' ? parseFloat(p.longitude) : p.longitude;
            return [lat, lng] as [number, number];
          })
      );
      mapRef.current?.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [properties, onPropertyClick]);

  useEffect(() => {
    if (selectedProperty && selectedProperty.latitude && selectedProperty.longitude) {
      const lat = typeof selectedProperty.latitude === 'string' ? parseFloat(selectedProperty.latitude) : selectedProperty.latitude;
      const lng = typeof selectedProperty.longitude === 'string' ? parseFloat(selectedProperty.longitude) : selectedProperty.longitude;
      mapRef.current?.setView([lat, lng], 15, { animate: true });
    }
  }, [selectedProperty]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" data-testid="map-container" />;
}
