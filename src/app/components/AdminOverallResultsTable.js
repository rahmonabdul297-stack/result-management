"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteStudentResult, fetchStudentResults } from "@/lib/resultApiClient";
import { TERM_LABELS } from "@/lib/cumulativeResults";
import { useSchoolClasses } from "@/app/context/SchoolClassesContext";
import { getClassConfig, groupResultsByClass } from "@/lib/classConfig";
import { toast } from "sonner";

function resultViewHref(id) {
  return `/result/${id}?from=admin`;
}

function termsLabel(item) {
  const list = item.termsIncluded;
  if (Array.isArray(list) && list.length) {
    return list.map((t) => TERM_LABELS[t] || t).join(", ");
  }
  return "—";
}

function ResultRows({ items, deletingId, onDelete }) {
  const router = useRouter();

  return items.map((item) => (
    <tr
      key={item.id}
      className="result-row-clickable"
      onClick={() => router.push(resultViewHref(item.id))}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(resultViewHref(item.id));
        }
      }}
      tabIndex={0}
      role="link"
    >
      <td>{item.name || "-"}</td>
      <td>{item.admissionNo || "-"}</td>
      <td>{getClassConfig(item.classSlug)?.label || item.className || "-"}</td>
      <td>{item.academicSession || "-"}</td>
      <td className="text-xs">{termsLabel(item)}</td>
      <td>
        {item.summary?.avg != null ? Number(item.summary.avg).toFixed(1) : "-"}
      </td>
      <td>{item.summary?.grade ?? "-"}</td>
      <td>
        {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : "-"}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap gap-2">
          <Link href={resultViewHref(item.id)} className="btn btn-gold btn-sm">
            View PDF
          </Link>
          <button
            type="button"
            className="btn btn-red btn-sm"
            disabled={deletingId === item.id}
            onClick={() => onDelete(item)}
          >
            {deletingId === item.id ? "Deleting…" : "Delete"}
          </button>
        </div>
      </td>
    </tr>
  ));
}

export default function AdminOverallResultsTable() {
  const { classConfig, classSlugs } = useSchoolClasses();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeClass, setActiveClass] = useState("all");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const loadResults = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchStudentResults({
        resultType: "cumulative",
        excludeCumulative: false,
      });
      setResults(data);
      setError("");
    } catch (err) {
      const msg = err?.message || "Failed to load overall results.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const sessions = useMemo(() => {
    const set = new Set(results.map((r) => r.academicSession).filter(Boolean));
    return [...set].sort().reverse();
  }, [results]);

  const filtered = useMemo(() => {
    let list = results;
    if (activeClass !== "all") {
      list = list.filter((r) => r.classSlug === activeClass);
    }
    if (sessionFilter !== "all") {
      list = list.filter((r) => r.academicSession === sessionFilter);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        (item.name || "").toLowerCase().includes(q) ||
        (item.admissionNo || "").toLowerCase().includes(q) ||
        (getClassConfig(item.classSlug, classConfig)?.label || "")
          .toLowerCase()
          .includes(q),
    );
  }, [results, activeClass, sessionFilter, search, classConfig]);

  const grouped = useMemo(
    () => groupResultsByClass(filtered, classConfig),
    [filtered, classConfig],
  );

  const classTabs = useMemo(() => {
    const counts = {};
    for (const r of results) {
      counts[r.classSlug] = (counts[r.classSlug] || 0) + 1;
    }
    return classSlugs.map((slug) => ({
      slug,
      label: getClassConfig(slug, classConfig).label,
      count: counts[slug] ?? 0,
    }));
  }, [results, classSlugs, classConfig]);

  const handleDelete = async (item) => {
    const label = item.name || item.admissionNo || "this result";
    if (!window.confirm(`Delete cumulative result for ${label}?`)) return;
    try {
      setDeletingId(item.id);
      await deleteStudentResult(item.id);
      setResults((prev) => prev.filter((r) => r.id !== item.id));
      toast.success(`Deleted cumulative result for ${label}.`);
    } catch (err) {
      toast.error(err?.message || "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  const visibleGroups =
    activeClass === "all" ? grouped : grouped.filter((g) => g.slug === activeClass);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--dark)]">
          Overall / Cumulative Results
        </h2>
        <p className="text-sm text-AppGray mt-1">
          Annual results calculated from 1st, 2nd, and 3rd term scores by class teachers.
        </p>
      </div>

      <div className="card mb-4 grid gap-4 sm:grid-cols-2">
        <div className="form-field">
          <label>Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, admission no, class..."
          />
        </div>
        <div className="form-field">
          <label>Academic session</label>
          <select value={sessionFilter} onChange={(e) => setSessionFilter(e.target.value)}>
            <option value="all">All sessions</option>
            {sessions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-AppGray mb-2">
          Filter by class
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`admin-class-tab ${activeClass === "all" ? "admin-class-tab-active" : ""}`}
            onClick={() => setActiveClass("all")}
          >
            All
            <span className="admin-class-tab-count">{results.length}</span>
          </button>
          {classTabs.map((tab) => (
            <button
              key={tab.slug}
              type="button"
              className={`admin-class-tab ${activeClass === tab.slug ? "admin-class-tab-active" : ""}`}
              onClick={() => setActiveClass(tab.slug)}
            >
              {tab.label}
              <span className="admin-class-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-AppGray">Loading overall results…</p> : null}
      {error ? <p className="text-red-500">{error}</p> : null}

      {!loading && !error && filtered.length === 0 ? (
        <p className="text-AppGray">
          No cumulative results yet. Teachers can build them from the class portal under
          &quot;Cumulative results&quot;.
        </p>
      ) : null}

      {!loading && visibleGroups.length > 0 ? (
        <div className="space-y-8">
          {visibleGroups.map((group) => (
            <section key={group.slug} className="admin-class-section">
              <h3 className="admin-class-section-title">{group.label}</h3>
              <p className="text-sm text-AppGray mb-3">
                {group.items.length} cumulative record{group.items.length === 1 ? "" : "s"}
              </p>
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="stbl w-full min-w-[900px]">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Adm No</th>
                        <th>Class</th>
                        <th>Session</th>
                        <th>Terms included</th>
                        <th>Cumulative avg</th>
                        <th>Grade</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <ResultRows
                        items={group.items}
                        deletingId={deletingId}
                        onDelete={handleDelete}
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
