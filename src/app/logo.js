"use client";

import Image from "next/image";
import { SCHOOL_LOGO_PATH } from "@/lib/siteMetadata";

const Logo = ({ size, className = "" }) => {
  const notifyResize = () => {
    window.dispatchEvent(new Event("resize"));
  };

  if (size) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full ${className}`.trim()}
        style={{ width: size, height: size }}
      >
        <Image
          src={SCHOOL_LOGO_PATH}
          alt="Ayodele Schools logo"
          width={size}
          height={size}
          className="h-full w-full rounded-full object-contain"
          onLoad={notifyResize}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full min-h-[32px] min-w-[32px] overflow-hidden rounded-full ${className}`.trim()}
    >
      <Image
        src={SCHOOL_LOGO_PATH}
        alt="Ayodele Schools logo"
        fill
        sizes="84px"
        className="rounded-full object-contain"
        onLoad={notifyResize}
      />
    </div>
  );
};

export default Logo;
