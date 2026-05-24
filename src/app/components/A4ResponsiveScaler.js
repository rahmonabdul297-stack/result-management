"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const A4_WIDTH_MM = 210;
const MM_TO_PX = 96 / 25.4;

/**
 * Scales fixed A4 (210mm) content to fit narrow viewports on phones/tablets.
 * Print always uses full size (see globals.css @media print).
 */
export default function A4ResponsiveScaler({ children, className = "" }) {
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [spacerHeight, setSpacerHeight] = useState(null);

  const updateScale = useCallback(() => {
    const el = innerRef.current;
    if (!el) return;

    const sheetWidthPx = el.offsetWidth || A4_WIDTH_MM * MM_TO_PX;
    const sheetHeightPx = el.offsetHeight || sheetWidthPx * (297 / 210);
    const horizontalPad = 16;
    const available = window.innerWidth - horizontalPad;
    const nextScale = Math.min(1, available / sheetWidthPx);

    setScale(nextScale);
    setSpacerHeight(Math.ceil(sheetHeightPx * nextScale));
  }, []);

  useEffect(() => {
    updateScale();
    const el = innerRef.current;
    const ro =
      el && typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScale) : null;
    if (el && ro) ro.observe(el);
    window.addEventListener("resize", updateScale);
    window.addEventListener("orientationchange", updateScale);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", updateScale);
      window.removeEventListener("orientationchange", updateScale);
    };
  }, [updateScale, children]);

  const isScaled = scale < 0.999;

  return (
    <div
      className={`a4-scale-viewport ${className}`.trim()}
      data-scaled={isScaled ? "true" : "false"}
    >
      <div
        className="a4-scale-spacer"
        style={spacerHeight != null ? { height: spacerHeight } : undefined}
        aria-hidden={!isScaled}
      >
        <div
          ref={innerRef}
          className="a4-scale-inner"
          style={
            isScaled
              ? {
                  transform: `translateX(-50%) scale(${scale})`,
                  transformOrigin: "top center",
                }
              : undefined
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
