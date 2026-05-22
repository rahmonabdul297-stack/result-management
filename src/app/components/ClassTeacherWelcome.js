"use client";

import { useEffect, useState } from "react";
import { getClassConfig } from "@/lib/classConfig";
import { fetchClassTeacher, getTeacherDisplayName } from "@/lib/classTeachersClient";

export default function ClassTeacherWelcome({
  classSlug,
  subtitle,
  session = "2025/2026 Academic Session",
}) {
  const config = getClassConfig(classSlug);
  const [teacherName, setTeacherName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const record = await fetchClassTeacher(classSlug);
        if (active) setTeacherName(getTeacherDisplayName(record));
      } catch {
        if (active) setTeacherName("Teacher");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [classSlug]);

  return (
    <div className="class-teacher-welcome">
      <div className="text-2xl sm:text-3xl font-semibold text-[var(--dark)]">
        {loading ? (
          "Welcome…"
        ) : (
          <>
            Welcome, <span className="text-[var(--green)]">{teacherName}</span>!
          </>
        )}
      </div>
      <div className="text-xs sm:text-sm text-AppGray mt-1">
        {session} · {config.label}
        {config.className !== config.label ? ` (${config.className})` : ""}
      </div>
      {subtitle ? <p className="text-sm text-AppGray mt-2">{subtitle}</p> : null}
    </div>
  );
}
