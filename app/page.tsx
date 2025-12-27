/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Map, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  AskPermissionResult,
  useGeoLocation,
} from "@/src/hooks/use-geolocation";
import { useEffect, useState } from "react";
import CasaDaVeraImage from "@/public/assets/arroz-com-galinha-da-vera.png";
import { MapPoint } from "@/src/types/map";
import { MapMarker } from "@/src/components/map-marker";
import { FaLocationDot } from "react-icons/fa6";

const interestPoints: MapPoint[] = [
  {
    id: 1,
    name: "Casa de Vera do arroz de galinha",
    mainImageUrl: CasaDaVeraImage,

    location: {
      latitude: -10.9126626,
      longitude: -37.6743148,
    },

    phoneNumber: "(79) 99999-9999",
  },
];

export default function MapPage() {
  const { askForPermission, getCurrentPosition } = useGeoLocation();

  const [permissionState, setPermissionState] = useState<AskPermissionResult>();

  const [userGeolocation, setUserGeolocation] = useState<{
    latitude: number;
    longitude: number;
  }>();

  async function getPermissionState() {
    const permissionState = await askForPermission();
    setPermissionState(permissionState);
  }

  async function getCurrentPositionViewState() {
    if (!permissionState) {
      return;
    }

    if (permissionState.currentPosition) {
      return setUserGeolocation({
        latitude: permissionState.currentPosition.coords.latitude,
        longitude: permissionState.currentPosition.coords.longitude,
      });
    }

    if (permissionState.state !== "granted") {
      return setUserGeolocation({
        latitude: -10.0771918,
        longitude: -37.3879654,
      });
    }

    const position = await getCurrentPosition();

    setUserGeolocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  }

  useEffect(() => {
    getPermissionState();
  }, []);

  useEffect(() => {
    if (permissionState) {
      getCurrentPositionViewState();
    }
  }, [permissionState]);

  return (
    <div className="flex flex-col min-h-screen items-center min-w-screen justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-3xl font-semibold text-gray-800 bg-blue500 dark:text-zinc-50 absolute top-8 z-10">
        Mapa Cultural de Lagarto-SE
      </h1>

      {userGeolocation ? (
        <Map
          initialViewState={{
            ...userGeolocation,
            zoom: 15,
          }}
          style={{ flex: 1 }}
          mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`}
        >
          {interestPoints.map((point) => (
            <MapMarker
              key={point.id}
              mapPoint={point}
              userLocation={userGeolocation}
            />
          ))}

          <Marker
            latitude={userGeolocation.latitude}
            longitude={userGeolocation.longitude}
            anchor="bottom"
          >
            <FaLocationDot color="#2b7fff" size={40} />
            <span className="text-sm text-center font-medium ml-[-10] ">
              Local atual
            </span>
          </Marker>
        </Map>
      ) : (
        <div>Loading map...</div>
      )}
    </div>
  );
}
