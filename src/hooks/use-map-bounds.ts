import { useMap } from "react-map-gl/maplibre";
import { useState, useEffect } from "react";

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function useMapBounds() {
  const { current: map } = useMap();
  const [bounds, setBounds] = useState<MapBounds | null>(null);

  useEffect(() => {
    if (!map) return;

    const updateBounds = () => {
      const mapBounds = map.getBounds();
      setBounds({
        north: mapBounds.getNorth(),
        south: mapBounds.getSouth(),
        east: mapBounds.getEast(),
        west: mapBounds.getWest(),
      });
    };

    // Initial update
    updateBounds();

    // Update on map move/zoom
    map.on("move", updateBounds);
    map.on("zoom", updateBounds);

    return () => {
      map.off("move", updateBounds);
      map.off("zoom", updateBounds);
    };
  }, [map]);

  return bounds;
}

export function isPointInBounds(
  lat: number,
  lng: number,
  bounds: MapBounds | null
): boolean {
  if (!bounds) return true;

  return (
    lat <= bounds.north &&
    lat >= bounds.south &&
    lng <= bounds.east &&
    lng >= bounds.west
  );
}

export interface EdgePosition {
  position:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  offsetX: number; // percentage from left (0-100)
  offsetY: number; // percentage from top (0-100)
}

export function calculateEdgePosition(
  lat: number,
  lng: number,
  bounds: MapBounds | null
): EdgePosition | null {
  if (!bounds) return null;

  const isNorth = lat > bounds.north;
  const isSouth = lat < bounds.south;
  const isEast = lng > bounds.east;
  const isWest = lng < bounds.west;

  // Calculate relative position within the viewport range
  const latRange = bounds.north - bounds.south;
  const lngRange = bounds.east - bounds.west;

  // Clamp to bounds and calculate percentage
  const clampedLat = Math.max(bounds.south, Math.min(bounds.north, lat));
  const clampedLng = Math.max(bounds.west, Math.min(bounds.east, lng));

  const offsetY = ((bounds.north - clampedLat) / latRange) * 100;
  const offsetX = ((clampedLng - bounds.west) / lngRange) * 100;

  // Determine edge position
  if (isNorth && isEast) {
    return { position: "top-right", offsetX: 85, offsetY: 5 };
  } else if (isNorth && isWest) {
    return { position: "top-left", offsetX: 5, offsetY: 5 };
  } else if (isSouth && isEast) {
    return { position: "bottom-right", offsetX: 85, offsetY: 95 };
  } else if (isSouth && isWest) {
    return { position: "bottom-left", offsetX: 5, offsetY: 95 };
  } else if (isNorth) {
    return { position: "top", offsetX, offsetY: 5 };
  } else if (isSouth) {
    return { position: "bottom", offsetX, offsetY: 95 };
  } else if (isEast) {
    return { position: "right", offsetX: 85, offsetY };
  } else if (isWest) {
    return { position: "left", offsetX: 5, offsetY };
  }

  return null;
}
