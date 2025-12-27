/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import React, { useState, useEffect } from "react";
import { Marker, Layer, Source, useMap } from "react-map-gl/maplibre";
import { MapPoint } from "../types/map";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useGetGeoRoute } from "@/src/services/route";
import { FaLocationDot } from "react-icons/fa6";
import { OpenRouteOnMap } from "./open-route-on-map";
import {
  useMapBounds,
  isPointInBounds,
  calculateEdgePosition,
} from "@/src/hooks/use-map-bounds";
import { EdgeIndicator } from "./edge-indicator";

interface MapMarkerProps {
  mapPoint: MapPoint;
  userLocation: { latitude: number; longitude: number };
}

export function MapMarker({ mapPoint, userLocation }: MapMarkerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldBounce, setShouldBounce] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [isRouteCardMinimized, setIsRouteCardMinimized] = useState(true);
  const { route, loading, fetchRoute } = useGetGeoRoute();
  const { current: map } = useMap();
  const bounds = useMapBounds();

  const isInView = isPointInBounds(
    mapPoint.location.latitude,
    mapPoint.location.longitude,
    bounds
  );

  const edgePosition =
    !isInView && !showRoute
      ? calculateEdgePosition(
          mapPoint.location.latitude,
          mapPoint.location.longitude,
          bounds
        )
      : null;

  const routeGeoJSON = route
    ? {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: route.coordinates,
        },
      }
    : null;

  function startRoutePrefetch() {
    if (!!route || !!loading) {
      return;
    }

    fetchRoute(userLocation, mapPoint.location);
  }

  function recalculateMapZoomToFitRoute() {
    if (!map || !route) return;

    // Calculate bounds from route coordinates
    const coordinates = route.coordinates;

    if (coordinates.length === 0) return;

    // Find min/max for longitude and latitude
    let minLng = coordinates[0][0];
    let maxLng = coordinates[0][0];
    let minLat = coordinates[0][1];
    let maxLat = coordinates[0][1];

    coordinates.forEach(([lng, lat]) => {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });

    // Add padding to bounds
    const padding = { top: 100, bottom: 200, left: 50, right: 50 };

    // Fit map to show entire route
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding,
        duration: 1000,
      }
    );
  }

  useEffect(() => {
    setShouldBounce(!isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded) {
      startRoutePrefetch();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (showRoute && route && map) {
      recalculateMapZoomToFitRoute();
    }
  }, [showRoute, route, map]);

  const handleEdgeIndicatorClick = () => {
    if (!map) return;

    map.flyTo({
      center: [mapPoint.location.longitude, mapPoint.location.latitude],
      zoom: 15,
      duration: 1500,
    });
  };

  return (
    <>
      {/* Edge Indicator when marker is off-screen */}
      <AnimatePresence>
        {edgePosition && (
          <EdgeIndicator
            name={mapPoint.name}
            edgePosition={edgePosition}
            onClick={handleEdgeIndicatorClick}
          />
        )}
      </AnimatePresence>

      {/* Route Line */}
      {routeGeoJSON && showRoute && userLocation && (
        <Source id={`route-${mapPoint.id}`} type="geojson" data={routeGeoJSON}>
          <Layer
            id={`route-layer-${mapPoint.id}`}
            type="line"
            paint={{
              "line-color": "#3b82f6",
              "line-width": 4,
              "line-opacity": 0.8,
            }}
          />
        </Source>
      )}

      {/* Marker */}
      <Marker
        latitude={mapPoint.location.latitude}
        longitude={mapPoint.location.longitude}
        anchor="bottom"
      >
        <div
          className="relative cursor-pointer"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {!isExpanded && (
            <div
              className="absolute w-60 h-60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
              onMouseEnter={startRoutePrefetch}
            />
          )}

          <AnimatePresence>
            {!isExpanded && !showRoute && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: shouldBounce ? [0, -20, 0, -10, 0] : 0,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  y: {
                    duration: 1,
                    ease: "easeOut",
                  },
                  repeat: shouldBounce ? Infinity : 0,
                  repeatDelay: 5,
                }}
                className="z-20"
              >
                <div className="relative">
                  {/* Pin Shape */}
                  <div className="relative flex flex-col items-center">
                    {/* Pin Circle Top */}
                    <motion.div
                      className="min-w-20 p-1 max-w-30 min-h-10 bg-blue-500 rounded-4xl border-3 border-white shadow-lg flex items-center justify-center flex-1"
                      whileHover={{ scale: 1.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <span
                        title={mapPoint.name}
                        className="text-white text-ellipsis text-xs font-bold text-center px-1 line-clamp-2"
                      >
                        {mapPoint.name}
                      </span>
                    </motion.div>
                    {/* Pin Point */}
                    <div
                      className="w-0 h-0 border-l-7 border-l-transparent border-r-7 border-r-transparent border-t-14 border-t-blue-500"
                      style={{ marginTop: "-2px" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Expanded Card State */}
          <AnimatePresence>
            {isExpanded && !showRoute && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20"
              >
                <motion.div
                  className="w-64 bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-blue-700 mb-2"
                  initial={{ rotateX: 15 }}
                  animate={{ rotateX: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Image Background with Name Overlay */}
                  <div className="relative h-40 w-full overflow-hidden">
                    <motion.div
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6 }}
                      className="relative h-full w-full"
                    >
                      <Image
                        src={mapPoint.mainImageUrl}
                        alt={mapPoint.name}
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
                    {/* Name on top of image */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 p-4"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <h3 className="text-white font-bold text-lg leading-tight">
                        {mapPoint.name}
                      </h3>
                    </motion.div>
                  </div>

                  {/* Info Section */}
                  <motion.div
                    className="p-4 bg-blue-50 rounded-b-2xl space-y-3"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <div className="flex items-center gap-2 text-blue-700">
                      <motion.svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{
                          delay: 0.4,
                          type: "spring",
                          stiffness: 500,
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </motion.svg>
                      <span className="font-semibold text-sm">
                        {mapPoint.phoneNumber}
                      </span>
                    </div>

                    {/* Route Button */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRoute(true);
                      }}
                      disabled={loading}
                      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      whileHover={{ scale: loading || !route ? 1 : 1.02 }}
                      whileTap={{ scale: loading || !route ? 1 : 0.98 }}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                    >
                      {loading ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          Carregando rota...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                          </svg>
                          Ver Rota
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Marker>

      {/* Route View State - Bottom of screen */}
      <AnimatePresence mode="wait">
        {showRoute && route && (
          <>
            <Marker
              latitude={mapPoint.location.latitude}
              longitude={mapPoint.location.longitude}
              anchor="bottom"
            >
              <motion.div
                key="mapPointMarker"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
              >
                <FaLocationDot color="#f0b100" size={40} />
              </motion.div>
            </Marker>

            {isRouteCardMinimized ? (
              /* Minimized - Floating Buttons */
              <motion.div
                key="minimized"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-3 bg-ye"
              >
                {/* Exit/Back Button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRoute(false);
                    setIsRouteCardMinimized(true);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-full shadow-2xl transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Sair da rota"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>

                {/* Show Info Button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRouteCardMinimized(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-full shadow-2xl transition-colors flex items-center gap-2 font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Mostrar informações"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Ver Informações</span>
                </motion.button>
              </motion.div>
            ) : (
              /* Expanded - Info Card */
              <motion.div
                key="expanded"
                initial={{ opacity: 0, y: 100, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
              >
                <motion.div
                  className="w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-blue-700 p-5"
                  layoutId="routeCard"
                >
                  <div className="space-y-4">
                    {/* Header with title and buttons */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg text-gray-800">
                        Rota para {mapPoint.name}
                      </h3>
                      <div className="flex gap-2">
                        {/* Minimize Button */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsRouteCardMinimized(true);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Minimizar"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </motion.button>
                        {/* Close Button */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowRoute(false);
                            setIsRouteCardMinimized(true);
                          }}
                          className="p-1.5 hover:bg-red-100 rounded-full transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Fechar"
                        >
                          <svg
                            className="w-5 h-5 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </motion.button>
                      </div>
                    </div>

                    {/* Route Information */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-3 bg-blue-50 p-4 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-gray-700 font-medium">
                            Distância:
                          </span>
                        </div>
                        <span className="font-bold text-blue-700 text-lg">
                          {(route.distance / 1000).toFixed(1)} km
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-gray-700 font-medium">
                            Tempo estimado:
                          </span>
                        </div>
                        <span className="font-bold text-blue-700 text-lg">
                          {Math.round(route.duration / 60)} min
                        </span>
                      </div>
                    </motion.div>

                    {/* Open in Maps Button */}
                    <OpenRouteOnMap
                      originLat={userLocation.latitude}
                      originLng={userLocation.longitude}
                      destLat={mapPoint.location.latitude}
                      destLng={mapPoint.location.longitude}
                      destinationName={mapPoint.name}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
}
