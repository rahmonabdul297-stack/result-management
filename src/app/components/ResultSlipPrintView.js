"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ResultSlipA4 from "@/app/components/ResultSlipA4";
import {
  DEFAULT_SCHOOL_SETTINGS,
  fetchSchoolSettings,
} from "@/lib/schoolSettingsClient";

export default function ResultSlipPrintView({
  result,
  backHref = "/admin/results",
  backLabel = "Back to results",
}) {
  const [school, setSchool] = useState(DEFAULT_SCHOOL_SETTINGS);

  useEffect(() => {
    let active = true;
    fetchSchoolSettings()
      .then((settings) => {
        if (active) setSchool(settings);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const slipData = {
    ...result,
    schoolName: result.schoolName || school.schoolName,
    schoolAddress: result.schoolAddress || school.schoolAddress,
    schoolTagline: result.schoolTagline || result.schoolMotto || school.schoolMotto,
    schoolEmail: school.schoolEmail,
    schoolWebsite: school.schoolWebsite,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="result-view-page min-h-screen bg-[var(--surface)]">
      <div className="result-view-toolbar no-print">
        <Link href={backHref} className="btn btn-outline btn-sm w-full sm:w-auto text-center">
          ← {backLabel}
        </Link>
        <button
          type="button"
          className="btn btn-gold btn-sm w-full sm:w-auto"
          onClick={handlePrint}
        >
          Print / Save as PDF
        </button>
      </div>
      <p className="result-view-mobile-hint no-print">
        Pinch or scroll to view the full slip. Use Print to save a full A4 PDF.
      </p>

      <div className="result-slip-print-visible">
        <ResultSlipA4 data={slipData} school={school} />
      </div>
    </div>
  );
}
