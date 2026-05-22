"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchStudentResults } from "@/lib/resultApiClient";
import { getClassConfig } from "@/lib/classConfig";
import ClassTeacherWelcome from "@/app/components/ClassTeacherWelcome";
import { toast } from "sonner";

export default function ClassResultsList({ classSlug }) {
  const config = getClassConfig(classSlug);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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

  const filtered = results.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (item.name || "").toLowerCase().includes(q) ||
      (item.admissionNo || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="overflow-y-auto w-full p-3 sm:p-6 lg:p-10">
      <div className="mb-6">
        <ClassTeacherWelcome
          classSlug={classSlug}
          subtitle="View and search every submitted result slip for this class."
        />
      </div>

      <div className="card mb-4">
        <div className="form-field">
          <label>Search by name or admission number</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type to search..."
          />
        </div>
      </div>

      {loading ? <p>Loading results...</p> : null}
      {error ? <p className="text-red-500">{error}</p> : null}

      {!loading && !error && filtered.length === 0 ? (
        <p className="text-AppGray">No results found for this class.</p>
      ) : null}

      {!loading && filtered.length > 0 ? (
        <div className="table-wrap">
          <table className="stbl w-full min-w-[700px]">
            <thead>
              <tr>
                <th>Student</th>
                <th>Adm No</th>
                <th>Term</th>
                <th>Session</th>
                <th>Average</th>
                <th>Grade</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.name || "-"}</td>
                  <td>{item.admissionNo || "-"}</td>
                  <td>{item.term || "-"}</td>
                  <td>{item.academicSession || "-"}</td>
                  <td>{item.summary?.avg != null ? Number(item.summary.avg).toFixed(1) : "-"}</td>
                  <td>{item.summary?.grade ?? "-"}</td>
                  <td>
                    <Link className="btn btn-outline btn-sm" href={`/dashboard/${classSlug}/resultdetails`}>
                      View / Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
