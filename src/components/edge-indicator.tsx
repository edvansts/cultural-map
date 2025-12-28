"use client";

import { motion } from "motion/react";
import { EdgePosition } from "@/src/hooks/use-map-bounds";

interface EdgeIndicatorProps {
  name: string;
  edgePosition: EdgePosition;
  onClick: () => void;
}

export function EdgeIndicator({
  name,
  edgePosition,
  onClick,
}: EdgeIndicatorProps) {
  const getArrowRotation = () => {
    switch (edgePosition.position) {
      case "top":
      case "top-left":
      case "top-right":
        return 0;
      case "bottom":
      case "bottom-left":
      case "bottom-right":
        return 180;
      case "left":
        return 270;
      case "right":
        return 90;
      default:
        return 0;
    }
  };

  const getTransform = () => {
    const position = edgePosition.position;

    // Para posições fixas nas bordas, ajusta a transformação
    if (position === "top-left") return "translate(0%, 0%)";
    if (position === "top-right") return "translate(-100%, 0%)";
    if (position === "bottom-left") return "translate(0%, -100%)";
    if (position === "bottom-right") return "translate(-100%, -100%)";
    if (position === "top") return "translate(-50%, 0%)";
    if (position === "bottom") return "translate(-50%, -100%)";
    if (position === "left") return "translate(0%, -50%)";
    if (position === "right") return "translate(-100%, -50%)";

    return "translate(-50%, -50%)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3 }}
      className="fixed z-40 pointer-events-auto"
      style={{
        left: `${edgePosition.offsetX}%`,
        top: `${edgePosition.offsetY}%`,
        transform: getTransform(),
      }}
    >
      <button
        onClick={onClick}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-colors"
        title={`Ir para ${name}`}
      >
        <motion.svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ rotate: `${getArrowRotation()}deg` }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 15l7-7 7 7"
          />
        </motion.svg>
        <span className="text-sm font-semibold max-w-32 truncate">{name}</span>
      </button>
    </motion.div>
  );
}
