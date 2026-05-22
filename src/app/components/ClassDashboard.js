"use client";

import { useEffect, useState } from "react";
import { LuNotebookText } from "react-icons/lu";
import { fetchStudentResults } from "@/lib/resultApiClient";
import { getClassConfig } from "@/lib/classConfig";
import ClassTeacherWelcome from "@/app/components/ClassTeacherWelcome";
import { toast } from "sonner";

export default function ClassDashboard({ classSlug }) {
  const config = getClassConfig(classSlug);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchStudentResults({ classSlug });
        setResults(data);
        setError("");
      } catch (err) {
        const msg = err?.message || "Failed to load results.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [classSlug]);

  const submittedCount = results.length;
  const averages = results.map((r) => r.summary?.avg).filter((v) => typeof v === "number");
  const classAvg = averages.length
    ? (averages.reduce((a, b) => a + b, 0) / averages.length).toFixed(1)
    : "—";
  const top = results.reduce(
    (best, item) => (!best || (item.summary?.avg ?? 0) > (best.summary?.avg ?? 0) ? item : best),
    null
  );
  const below50 = results.filter((r) => (r.summary?.avg ?? 0) < 50).length;

  return (
    <div className="overflow-y-auto w-full p-10">
      <section className="flex flex-col gap-10">
        <ClassTeacherWelcome
          classSlug={classSlug}
          subtitle="Class overview — submissions, averages, and recent activity."
        />

        <section className="flex flex-col lg:grid grid-cols-5 gap-4">
          <div className="stat-card">
            <div className="stat-label">Your Class</div>
            <div className="stat-value">{config.label}</div>
            <div className="stat-sub">—</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Submitted (This Term)</div>
            <div className="stat-value">{submittedCount}</div>
            <div className="stat-sub">result sheets</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">class Average</div>
            <div className="stat-value">{classAvg}</div>
            <div className="stat-sub">across your results</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Highest Score</div>
            <div className="stat-value">{top ? Number(top.summary?.avg ?? 0).toFixed(1) : "—"}</div>
            <div className="stat-sub">{top?.name || "—"}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Below 50 (Avg)</div>
            <div className="stat-value">{below50}</div>
            <div className="stat-sub">need attention</div>
          </div>
        </section>

        <section className="stat-card h-[500px]">
          <div className="flex items-center gap-2 border-b py-1.5">
            <LuNotebookText />
            <div className="text-bold">Recent Submissions</div>
          </div>
          {loading ? (
            <div className="h-full text-AppGray py-5 flex items-center justify-center text-center">Loading...</div>
          ) : error ? (
            <div className="h-full text-red-500 py-5 flex items-center justify-center text-center">{error}</div>
          ) : results.length === 0 ? (
            <div className="h-full text-AppGray py-5 flex items-center justify-center text-center">No results yet.</div>
          ) : (
            <div className="py-4 space-y-2 overflow-y-auto max-h-[420px]">
              {results.slice(0, 10).map((item) => (
                <div key={item.id} className="border-b border-AppGray/30 pb-2 text-sm">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-AppGray">
                    {item.admissionNo} · Avg{" "}
                    {item.summary?.avg != null ? Number(item.summary.avg).toFixed(1) : "—"} · Grade{" "}
                    {item.summary?.grade ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
