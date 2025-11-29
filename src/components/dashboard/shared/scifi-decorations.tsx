"use client";

import React from "react";

export function ScifiCorner({ position = "top-left", className = "" }: { position?: "top-left" | "top-right" | "bottom-left" | "bottom-right", className?: string }) {
  const styles = {
    "top-left": "top-0 left-0 border-t-2 border-l-2 rounded-tl-md",
    "top-right": "top-0 right-0 border-t-2 border-r-2 rounded-tr-md",
    "bottom-left": "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-md",
    "bottom-right": "bottom-0 right-0 border-b-2 border-r-2 rounded-br-md",
  };

  return (
    <div className={`absolute w-3 h-3 border-primary/60 ${styles[position]} ${className}`} />
  );
}

export function ScifiScanline() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-0 opacity-20">
      <div className="w-full h-[2px] bg-primary/30 absolute top-0 animate-scanline shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))]" style={{ backgroundSize: "100% 2px, 3px 100%" }} />
    </div>
  );
}
