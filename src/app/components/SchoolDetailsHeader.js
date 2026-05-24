"use client";

import Logo from "@/app/logo";
import { DEFAULT_SCHOOL_SETTINGS } from "@/lib/schoolSettingsClient";

/**
 * School branding block displayed above the result slip on the A4 sheet.
 */
export default function SchoolDetailsHeader({ school = {} }) {
  const schoolName =
    school.schoolName?.trim() || DEFAULT_SCHOOL_SETTINGS.schoolName;
  const schoolAddress =
    school.schoolAddress?.trim() || DEFAULT_SCHOOL_SETTINGS.schoolAddress;
  const schoolMotto =
    school.schoolMotto?.trim() ||
    school.schoolTagline?.trim() ||
    DEFAULT_SCHOOL_SETTINGS.schoolMotto;
  const schoolEmail = school.schoolEmail?.trim() || "";
  const schoolWebsite = school.schoolWebsite?.trim() || "";

  return (
    <header className="a4-school-details" aria-label="School details">
      <div className="a4-school-logo">
        <Logo />
      </div>
      <div className="a4-school-text">
        <h1 className="a4-school-name">{schoolName}</h1>
        {schoolAddress ? <p className="a4-school-address">{schoolAddress}</p> : null}
        {schoolMotto ? (
          <p className="a4-school-motto">
            <em>{schoolMotto}</em>
          </p>
        ) : null}
      </div>
      {schoolEmail || schoolWebsite ? (
        <div className="a4-school-contact">
          {schoolEmail ? <p>Email: {schoolEmail}</p> : null}
          {schoolWebsite ? <p>Website: {schoolWebsite}</p> : null}
        </div>
      ) : null}
    </header>
  );
}
