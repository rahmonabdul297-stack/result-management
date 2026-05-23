"use client";

import A4ResponsiveScaler from "@/app/components/A4ResponsiveScaler";
import SchoolDetailsHeader from "@/app/components/SchoolDetailsHeader";
import ResultSlipTemplate from "@/app/components/ResultSlipTemplate";

/**
 * Full result output: school details on top + result slip, fixed to one A4 page.
 */
export default function ResultSlipA4({ data, school = {}, className = "" }) {
  const slipData = {
    ...data,
    schoolName: data.schoolName || school.schoolName,
    schoolAddress: data.schoolAddress || school.schoolAddress,
    schoolTagline: data.schoolTagline || data.schoolMotto || school.schoolMotto,
    schoolEmail: school.schoolEmail || data.schoolEmail,
    schoolWebsite: school.schoolWebsite || data.schoolWebsite,
  };

  return (
    <A4ResponsiveScaler className={className}>
      <div className="a4-sheet-outer">
        <div className="a4-sheet">
          <SchoolDetailsHeader school={slipData} />
          <div className="a4-slip-divider" aria-hidden="true" />
          <div className="a4-slip-content">
            <ResultSlipTemplate data={slipData} school={school} omitSchoolHeader />
          </div>
        </div>
      </div>
    </A4ResponsiveScaler>
  );
}
