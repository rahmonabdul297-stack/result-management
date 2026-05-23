"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchStudentResults } from "@/lib/resultApiClient";
import { isCumulativeResult } from "@/lib/cumulativeResults";
import { getClassResultCounts } from "@/lib/classConfig";
import { useSchoolClasses } from "@/app/context/SchoolClassesContext";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminOverview() {
  const { classConfig } = useSchoolClasses();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchStudentResults();
        setResults(data);
      } catch (err) {
        toast.error(err?.message || "Failed to load overview.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const termResults = useMemo(() => results.filter((r) => !isCumulativeResult(r)), [results]);
  const cumulativeResults = useMemo(
    () => results.filter((r) => isCumulativeResult(r)),
    [results],
  );

  const classCounts = useMemo(
    () => getClassResultCounts(termResults, classConfig),
    [termResults, classConfig],
  );

  const classCount = classCounts.filter((c) => c.count > 0).length;
  const avgScores = termResults
    .map((r) => r.summary?.avg)
    .filter((v) => typeof v === "number");
  const overallAvg = avgScores.length
    ? (avgScores.reduce((a, b) => a + b, 0) / avgScores.length).toFixed(1)
    : "—";

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--dark)]">Admin Overview</h2>
        <p className="text-sm text-AppGray mt-1">School-wide summary of submitted result slips.</p>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        <div className="stat-card">
          <div className="stat-label">Term Submissions</div>
          <div className="stat-value">{loading ? "…" : termResults.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cumulative Results</div>
          <div className="stat-value">{loading ? "…" : cumulativeResults.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Classes Active</div>
          <div className="stat-value">{loading ? "…" : classCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overall Average</div>
          <div className="stat-value">{loading ? "…" : overallAvg}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Latest Update</div>
          <div className="stat-value text-base sm:text-lg">
            {loading || !results[0]?.submittedAt
              ? "—"
              : new Date(results[0].submittedAt).toLocaleDateString()}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[var(--dark)]">Results by Class</h3>
            <p className="text-sm text-AppGray">
              Submissions grouped by JSS class. Select a class to view its records.
            </p>
          </div>
          <Link href="/admin/results" className="btn btn-outline btn-sm shrink-0">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {classCounts.map((item) => {
            const classAvg = item.items
              .map((r) => r.summary?.avg)
              .filter((v) => typeof v === "number");
            const avg =
              classAvg.length > 0
                ? (classAvg.reduce((a, b) => a + b, 0) / classAvg.length).toFixed(1)
                : "—";

            return (
              <Link
                key={item.slug}
                href={`/admin/results?class=${item.slug}`}
                className={`admin-class-card ${item.count > 0 ? "admin-class-card-active" : ""}`}
              >
                <span className="admin-class-card-label">{item.label}</span>
                <span className="admin-class-card-count">
                  {loading ? "…" : item.count}
                </span>
                <span className="admin-class-card-meta">
                  {loading ? "Loading" : `${item.count} submission${item.count === 1 ? "" : "s"}`}
                </span>
                <span className="admin-class-card-avg">Avg: {loading ? "…" : avg}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="card">
        <h3 className="font-semibold mb-3">Quick actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/results" className="btn btn-green">
            Term results
          </Link>
          <Link href="/admin/overall-results" className="btn btn-outline">
            Overall results
          </Link>
          <Link href="/admin/teachers" className="btn btn-outline">
            Manage class teachers
          </Link>
          <Link href="/admin/settings" className="btn btn-outline">
            School settings
          </Link>
          <Link href="/checkResult" className="btn btn-outline">
            Result check portal
          </Link>
        </div>
      </div>
    </div>
  );
}
