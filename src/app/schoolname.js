"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_SCHOOL_SETTINGS,
  fetchSchoolSettings,
} from "@/lib/schoolSettingsClient";

const Schoolname = ({ name, className = "font-[font-geist-sans] text-center" }) => {
  const [displayName, setDisplayName] = useState(
    name || DEFAULT_SCHOOL_SETTINGS.schoolName,
  );

  useEffect(() => {
    if (name) {
      setDisplayName(name);
      return;
    }

    let active = true;
    fetchSchoolSettings()
      .then((settings) => {
        if (active && settings.schoolName) {
          setDisplayName(settings.schoolName);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [name]);

  return <div className={className}>{displayName}</div>;
};

export default Schoolname;
