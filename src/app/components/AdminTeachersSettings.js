"use client";

import { useCallback, useEffect, useState } from "react";
import { CLASS_SLUGS } from "@/lib/classConfig";
import {
  DEFAULT_STAFF_IDS,
  fetchAllClassTeachers,
  saveAllClassTeachers,
  saveClassTeacher,
} from "@/lib/classTeachersClient";
import { toast } from "sonner";

function emptyFormState() {
  return CLASS_SLUGS.reduce((acc, slug) => {
    acc[slug] = { teacherName: "", staffId: DEFAULT_STAFF_IDS[slug] || "" };
    return acc;
  }, {});
}

export default function AdminTeachersSettings() {
  const [form, setForm] = useState(emptyFormState);
  const [labels, setLabels] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingSlug, setSavingSlug] = useState(null);
  const [savingAll, setSavingAll] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllClassTeachers();
      const next = emptyFormState();
      const nextLabels = {};
      for (const slug of CLASS_SLUGS) {
        next[slug] = {
          teacherName: data[slug]?.teacherName || "",
          staffId: data[slug]?.staffId || DEFAULT_STAFF_IDS[slug] || "",
        };
        nextLabels[slug] = data[slug]?.label || slug;
      }
      setForm(next);
      setLabels(nextLabels);
    } catch (err) {
      toast.error(err?.message || "Failed to load teacher settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateField = (slug, field, value) => {
    setForm((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], [field]: value },
    }));
  };

  const handleSaveOne = async (slug) => {
    try {
      setSavingSlug(slug);
      await saveClassTeacher(slug, form[slug]);
      toast.success(`${labels[slug] || slug} teacher saved.`);
    } catch (err) {
      toast.error(err?.message || "Failed to save.");
    } finally {
      setSavingSlug(null);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSavingAll(true);
      await saveAllClassTeachers(form);
      toast.success("All class teachers saved.");
    } catch (err) {
      toast.error(err?.message || "Failed to save all teachers.");
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[var(--dark)]">
            Manage Class Teachers
          </h2>
          <p className="text-sm text-AppGray mt-1">
            Assign a teacher name to each class. It appears on that class dashboard as
            &quot;Welcome, [name]!&quot;
          </p>
        </div>
        <button
          type="button"
          className="btn btn-green shrink-0"
          disabled={loading || savingAll}
          onClick={handleSaveAll}
        >
          {savingAll ? "Saving all…" : "Save all classes"}
        </button>
      </div>

      {loading ? (
        <p className="text-AppGray">Loading teacher settings…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CLASS_SLUGS.map((slug) => (
            <div key={slug} className="card admin-teacher-card">
              <div className="admin-teacher-card-head">
                <span className="admin-class-card-label">{labels[slug]}</span>
                <span className="text-xs text-AppGray font-mono">{slug}</span>
              </div>

              <div className="form-field">
                <label htmlFor={`teacher-${slug}`}>Teacher name</label>
                <input
                  id={`teacher-${slug}`}
                  type="text"
                  value={form[slug]?.teacherName ?? ""}
                  onChange={(e) => updateField(slug, "teacherName", e.target.value)}
                  placeholder="e.g. Mr. Adebayo Johnson"
                />
              </div>

              <div className="form-field">
                <label htmlFor={`staff-${slug}`}>Staff ID</label>
                <input
                  id={`staff-${slug}`}
                  type="text"
                  value={form[slug]?.staffId ?? ""}
                  onChange={(e) => updateField(slug, "staffId", e.target.value)}
                  placeholder={DEFAULT_STAFF_IDS[slug]}
                />
                <p className="text-xs text-AppGray mt-1">
                  Login ID for this class teacher (e.g. {DEFAULT_STAFF_IDS[slug]}).
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm w-full mt-2"
                disabled={savingSlug === slug || savingAll}
                onClick={() => handleSaveOne(slug)}
              >
                {savingSlug === slug ? "Saving…" : `Save ${labels[slug]}`}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="admin-banner mt-8">
        <span>💡</span>
        <span>
          After saving, open any class teacher dashboard to see{" "}
          <strong>Welcome, [teacher name]!</strong> at the top of the page.
        </span>
      </div>
    </div>
  );
}
