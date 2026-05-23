"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteStudentResult, fetchStudentResults } from "@/lib/resultApiClient";
import { useSchoolClasses } from "@/app/context/SchoolClassesContext";
import { getClassConfig, groupResultsByClass } from "@/lib/classConfig";
import { toast } from "sonner";

function resultViewHref(id) {
  return `/result/${id}?from=admin`;
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
      aria-label={`View result slip for ${item.name || item.admissionNo}`}
    >
      <td>{item.name || "-"}</td>
      <td>{item.admissionNo || "-"}</td>
      <td>{item.term || "-"}</td>
      <td>{item.academicSession || "-"}</td>
      <td>
        {item.summary?.avg != null ? Number(item.summary.avg).toFixed(1) : "-"}
      </td>
      <td>{item.summary?.grade ?? "-"}</td>
      <td>
        {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : "-"}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap gap-2">
          <Link
            href={resultViewHref(item.id)}
            className="btn btn-gold btn-sm"
            onClick={(e) => e.stopPropagation()}
          >
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

export default function AdminResultsTable({
  title = "All School Results",
  description,
  initialClassFilter = "all",
}) {
  const { classConfig, classSlugs } = useSchoolClasses();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeClass, setActiveClass] = useState(
    initialClassFilter && (initialClassFilter === "all" || classSlugs.includes(initialClassFilter))
      ? initialClassFilter
      : "all",
  );
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (
      initialClassFilter &&
      initialClassFilter !== "all" &&
      classSlugs.includes(initialClassFilter)
    ) {
      setActiveClass(initialClassFilter);
    }
  }, [initialClassFilter, classSlugs]);

  const loadResults = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchStudentResults();
      setResults(data);
      setError("");
    } catch (err) {
      const msg = err?.message || "Failed to load results.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const handleDelete = async (item) => {
    const label = item.name || item.admissionNo || "this result";
    const confirmed = window.confirm(
      `Delete result for ${label}? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      setDeletingId(item.id);
      await deleteStudentResult(item.id);
      setResults((prev) => prev.filter((r) => r.id !== item.id));
      toast.success(`Deleted result for ${label}.`);
    } catch (err) {
      toast.error(err?.message || "Failed to delete result.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return results;
    return results.filter(
      (item) =>
        (item.name || "").toLowerCase().includes(q) ||
        (item.admissionNo || "").toLowerCase().includes(q) ||
        (item.className || "").toLowerCase().includes(q) ||
        (getClassConfig(item.classSlug, classConfig)?.label || "")
          .toLowerCase()
          .includes(q),
    );
  }, [results, search, classConfig]);

  const grouped = useMemo(
    () => groupResultsByClass(filtered, classConfig),
    [filtered, classConfig],
  );

  const classTabs = useMemo(() => {
    const counts = Object.fromEntries(
      groupResultsByClass(results, classConfig).map((g) => [g.slug, g.items.length]),
    );
    return classSlugs.map((slug) => ({
      slug,
      label: getClassConfig(slug, classConfig).label,
      count: counts[slug] ?? 0,
    }));
  }, [results, classSlugs, classConfig]);

  const visibleGroups = useMemo(() => {
    if (activeClass === "all") return grouped;
    return grouped.filter((g) => g.slug === activeClass);
  }, [grouped, activeClass]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--dark)]">{title}</h2>
        {description ? (
          <p className="text-sm text-AppGray mt-1">{description}</p>
        ) : null}
        <p className="text-xs text-AppGray mt-2">
          Click any row or &quot;View PDF&quot; to open the printable result slip.
        </p>
      </div>

      <div className="card mb-4">
        <div className="form-field">
          <label>Search students</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, admission no, or class..."
          />
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
            All classes
            <span className="admin-class-tab-count">{filtered.length}</span>
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

      {loading ? <p className="text-AppGray">Loading results...</p> : null}
      {error ? <p className="text-red-500">{error}</p> : null}

      {!loading && !error && filtered.length === 0 ? (
        <p className="text-AppGray">No results found.</p>
      ) : null}

      {!loading && visibleGroups.length > 0 ? (
        <div className="space-y-8">
          {visibleGroups.map((group) => (
            <section key={group.slug} className="admin-class-section">
              <div className="admin-class-section-head">
                <div>
                  <h3 className="admin-class-section-title">{group.label}</h3>
                  <p className="text-sm text-AppGray">
                    {group.items.length} student
                    {group.items.length === 1 ? "" : "s"}
                    {group.className !== group.label ? ` · ${group.className}` : ""}
                  </p>
                </div>
                {activeClass === "all" ? (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveClass(group.slug)}
                  >
                    View only {group.label}
                  </button>
                ) : null}
              </div>

              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="stbl w-full min-w-[760px]">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Adm No</th>
                        <th>Term</th>
                        <th>Session</th>
                        <th>Average</th>
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

      {!loading && !error && filtered.length > 0 && visibleGroups.length === 0 ? (
        <p className="text-AppGray">No results in this class.</p>
      ) : null}
    </div>
  );
}
