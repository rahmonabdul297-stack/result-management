"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useToogleContext } from "@/app/context/page";

export default function DashboardPathSync() {
  const pathname = usePathname();
  const { setUrlPath } = useToogleContext();

  useEffect(() => {
    const match = pathname.match(/\/dashboard\/(class(?:one|two|three|four|five|six))/);
    if (match) setUrlPath(match[1]);
  }, [pathname, setUrlPath]);

  return null;
}
