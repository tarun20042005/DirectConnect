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
  showUserLocation?: boolean;
}

export function PropertyMap({
  properties,
  selectedProperty,
  onPropertyClick,
  center = [12.9716, 77.5946],
  zoom = 11,
  showUserLocation = true,
}: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(center, zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Ensure map container size is correct
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    mapRef.current = map;

    // Request user geolocation if enabled
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current && userMarkerRef.current === null) {
            const userIcon = L.divIcon({
              className: "user-location-marker",
              html: `
                <div class="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg" style="transform: translate(-50%, -50%); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid white;">
                  📍
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });
            userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
              .addTo(mapRef.current)
              .bindPopup("Your Location");
            mapRef.current.setView([latitude, longitude], zoom);
          }
        },
        (error) => {
          console.log("Geolocation not available:", error.message);
        }
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
    };
  }, [center, zoom, showUserLocation]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    properties.forEach((property) => {
      const lat = typeof property.latitude === 'string' ? parseFloat(property.latitude) : property.latitude;
      const lng = typeof property.longitude === 'string' ? parseFloat(property.longitude) : property.longitude;
      
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

      const priceIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div class="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold shadow-lg whitespace-nowrap" style="transform: translate(-50%, -100%);">
            ₹${(parseInt(property.price) || 0).toLocaleString('en-IN')}/mo
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 30],
      });

      const marker = L.marker([lat, lng], { icon: priceIcon })
        .addTo(mapRef.current!);

      if (onPropertyClick) {
        marker.on("click", () => onPropertyClick(property));
      }

      markersRef.current.push(marker);
    });

    if (properties.length > 0) {
      const validProperties = properties.filter(p => {
        const lat = typeof p.latitude === 'string' ? parseFloat(p.latitude) : p.latitude;
        const lng = typeof p.longitude === 'string' ? parseFloat(p.longitude) : p.longitude;
        return lat && lng && !isNaN(lat) && !isNaN(lng);
      });

      if (validProperties.length > 0) {
        const bounds = L.latLngBounds(
          validProperties.map(p => {
            const lat = typeof p.latitude === 'string' ? parseFloat(p.latitude) : p.latitude;
            const lng = typeof p.longitude === 'string' ? parseFloat(p.longitude) : p.longitude;
            return [lat, lng] as [number, number];
          })
        );
        mapRef.current?.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
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
