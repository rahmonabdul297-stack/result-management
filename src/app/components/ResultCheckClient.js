"use client";

import { useEffect, useState } from "react";
import ResultSlipPrintView from "@/app/components/ResultSlipPrintView";
import { findStudentResult } from "@/lib/resultApiClient";
import {
  DEFAULT_SCHOOL_SETTINGS,
  fetchSchoolSettings,
} from "@/lib/schoolSettingsClient";
import { toast } from "sonner";

const SESSION_OPTIONS = ["2024/2025", "2025/2026", "2026/2027", "2027/2028"];

const TERM_OPTIONS = [
  { value: "1st", label: "First Term" },
  { value: "2nd", label: "Second Term" },
  { value: "3rd", label: "Third Term" },
  { value: "Overall", label: "Cumulative / Annual" },
];

export default function ResultCheckClient() {
  const [school, setSchool] = useState(DEFAULT_SCHOOL_SETTINGS);
  const [studentId, setStudentId] = useState("");
  const [academicSession, setAcademicSession] = useState("");
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

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

  const schoolTitle = [school.schoolName, school.schoolAddress]
    .filter(Boolean)
    .join(", ");

  const handleCheck = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!studentId.trim() || !academicSession || !term) {
      const msg = "Enter Student ID and select year and term.";
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      const found = await findStudentResult({
        admissionNo: studentId,
        academicSession,
        term,
      });
      setResult(found);
      toast.success("Result loaded successfully.");
    } catch (err) {
      const msg = err?.message || "Could not find result.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setResult(null);
    setError("");
  };

  if (result) {
    return (
      <div className="result-check-page result-check-page--slip">
        <ResultSlipPrintView
          result={{
            ...result,
            schoolName: result.schoolName || school.schoolName,
            schoolAddress: result.schoolAddress || school.schoolAddress,
            schoolTagline: result.schoolTagline || school.schoolMotto,
          }}
          backHref="/checkResult"
          backLabel="Check another result"
        />
      </div>
    );
  }

  return (
    <div className="result-check-page">
      <div className="result-check-card">
        <header className="result-check-header">
          <h1>{schoolTitle || DEFAULT_SCHOOL_SETTINGS.schoolName}</h1>
          {school.schoolMotto ? (
            <p className="result-check-motto">
              <em>{school.schoolMotto}</em>
            </p>
          ) : null}
          <p className="result-check-sub">
            Enter Student ID and select year &amp; term to check result
          </p>
        </header>

        <form className="result-check-form" onSubmit={handleCheck}>
          <div className="result-check-field">
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="ENTER YOUR STUDENT ID"
              autoComplete="off"
              aria-label="Student ID"
            />
          </div>

          <div className="result-check-field">
            <select
              value={academicSession}
              onChange={(e) => setAcademicSession(e.target.value)}
              aria-label="Academic year"
            >
              <option value="">Select Year</option>
              {SESSION_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="result-check-field">
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              aria-label="Term"
            >
              <option value="">Select Term</option>
              {TERM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error ? <p className="result-check-error">{error}</p> : null}

          <button type="submit" className="result-check-btn" disabled={loading}>
            {loading ? "Checking…" : "Check Result"}
          </button>
        </form>
      </div>
    </div>
  );
}
