"use client";

import { useState } from "react";
import Image from "next/image";
import { SCHOOL_LOGO_PATH } from "@/lib/siteMetadata";

const LOGO_FALLBACK = "/ayodele logo.webp";

const Logo = ({ size, className = "" }) => {
  const [src, setSrc] = useState(SCHOOL_LOGO_PATH);

  const handleError = () => {
    if (src !== LOGO_FALLBACK) setSrc(LOGO_FALLBACK);
  };

  const handleLoad = () => {
    window.dispatchEvent(new Event("resize"));
  };

  if (size) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full ${className}`.trim()}
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt="Ayodele Schools logo"
          width={size}
          height={size}
          className="h-full w-full rounded-full object-contain"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full min-h-[32px] min-w-[32px] overflow-hidden rounded-full ${className}`.trim()}
    >
      <Image
        src={src}
        alt="Ayodele Schools logo"
        fill
        sizes="84px"
        className="rounded-full object-contain"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default Logo;
