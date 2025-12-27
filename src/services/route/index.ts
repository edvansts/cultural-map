import { useState } from "react";

export interface RouteCoordinates {
  longitude: number;
  latitude: number;
}

export interface RouteResponse {
  coordinates: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
}

export async function getRoute(
  start: RouteCoordinates,
  end: RouteCoordinates
): Promise<RouteResponse | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTESERVICE_API_KEY;

    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start.longitude},${start.latitude}&end=${end.longitude},${end.latitude}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch route");
    }

    const data = await response.json();
    const route = data.features[0];

    return {
      coordinates: route.geometry.coordinates,
      distance: route.properties.segments[0].distance,
      duration: route.properties.segments[0].duration,
    };
  } catch (error) {
    console.error("Error fetching route:", error);
    throw error;
  }
}

export const useGetGeoRoute = () => {
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoute = async (start: RouteCoordinates, end: RouteCoordinates) => {
    setLoading(true);
    setError(null);

    try {
      const routeData = await getRoute(start, end);

      setRoute(routeData);
      setLoading(false);
    } catch (error) {
      setError(error?.toString() || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { route, loading, error, fetchRoute };
};
