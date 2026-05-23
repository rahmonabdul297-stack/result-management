"use client";

import { useCallback, useEffect, useState } from "react";
import { useSchoolClasses } from "@/app/context/SchoolClassesContext";
import {
  DEFAULT_STAFF_IDS,
  fetchAllClassTeachers,
  saveAllClassTeachers,
  saveClassTeacher,
} from "@/lib/classTeachersClient";
import { addSchoolClass } from "@/lib/schoolClassesClient";
import { toast } from "sonner";

function emptyFormState(classSlugs) {
  return classSlugs.reduce((acc, slug) => {
    acc[slug] = { teacherName: "", staffId: DEFAULT_STAFF_IDS[slug] || "" };
    return acc;
  }, {});
}

export default function AdminTeachersSettings() {
  const { classSlugs, classConfig, refresh: refreshClasses } = useSchoolClasses();
  const [form, setForm] = useState({});
  const [labels, setLabels] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingSlug, setSavingSlug] = useState(null);
  const [savingAll, setSavingAll] = useState(false);
  const [addingClass, setAddingClass] = useState(false);
  const [newClass, setNewClass] = useState({
    label: "",
    className: "",
    teacherName: "",
    staffId: "",
    loginPassword: "class2026",
  });

  const load = useCallback(async () => {
    if (!classSlugs.length) return;
    try {
      setLoading(true);
      const data = await fetchAllClassTeachers();
      const next = emptyFormState(classSlugs);
      const nextLabels = {};
      for (const slug of classSlugs) {
        next[slug] = {
          teacherName: data[slug]?.teacherName || "",
          staffId: data[slug]?.staffId || DEFAULT_STAFF_IDS[slug] || "",
        };
        nextLabels[slug] = data[slug]?.label || classConfig[slug]?.label || slug;
      }
      setForm(next);
      setLabels(nextLabels);
    } catch (err) {
      toast.error(err?.message || "Failed to load teacher settings.");
    } finally {
      setLoading(false);
    }
  }, [classSlugs, classConfig]);

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

  const handleAddClass = async () => {
    const label = newClass.label.trim();
    const className = (newClass.className || newClass.label).trim();
    const teacherName = newClass.teacherName.trim();
    const staffId = newClass.staffId.trim();
    const loginPassword = newClass.loginPassword.trim() || "class2026";

    if (!label) {
      toast.error("Class name is required.");
      return;
    }
    if (!teacherName) {
      toast.error("Teacher name is required.");
      return;
    }
    if (!staffId) {
      toast.error("Staff ID is required for teacher login.");
      return;
    }

    try {
      setAddingClass(true);
      const created = await addSchoolClass({ label, className });
      await saveClassTeacher(created.slug, { teacherName, staffId, loginPassword });
      await refreshClasses();
      setNewClass({
        label: "",
        className: "",
        teacherName: "",
        staffId: "",
        loginPassword: "class2026",
      });
      toast.success(`${label} added. Teachers can log in with staff ID ${staffId}.`);
    } catch (err) {
      toast.error(err?.message || "Failed to add class.");
    } finally {
      setAddingClass(false);
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
            Add new classes, assign teachers, and set staff IDs for dashboard login.
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

      <section className="card mb-8 max-w-2xl">
        <h3 className="font-semibold text-[var(--dark)] mb-1">Add new class</h3>
        <p className="text-sm text-AppGray mb-4">
          Creates a class dashboard at <code className="text-xs">/dashboard/[class]</code> and
          registers the teacher login.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="form-field sm:col-span-2">
            <label htmlFor="new-class-label">Class name</label>
            <input
              id="new-class-label"
              type="text"
              value={newClass.label}
              onChange={(e) => setNewClass((p) => ({ ...p, label: e.target.value }))}
              placeholder="e.g. JSS 1 or PRY 7"
            />
          </div>
          <div className="form-field">
            <label htmlFor="new-class-display">Display name (optional)</label>
            <input
              id="new-class-display"
              type="text"
              value={newClass.className}
              onChange={(e) => setNewClass((p) => ({ ...p, className: e.target.value }))}
              placeholder="Same as class name if empty"
            />
          </div>
          <div className="form-field">
            <label htmlFor="new-class-staff">Staff ID (login)</label>
            <input
              id="new-class-staff"
              type="text"
              value={newClass.staffId}
              onChange={(e) => setNewClass((p) => ({ ...p, staffId: e.target.value }))}
              placeholder="e.g. TCH007"
            />
          </div>
          <div className="form-field sm:col-span-2">
            <label htmlFor="new-class-teacher">Teacher name</label>
            <input
              id="new-class-teacher"
              type="text"
              value={newClass.teacherName}
              onChange={(e) => setNewClass((p) => ({ ...p, teacherName: e.target.value }))}
              placeholder="e.g. Mrs. Adeola Smith"
            />
          </div>
          <div className="form-field sm:col-span-2">
            <label htmlFor="new-class-password">Login password</label>
            <input
              id="new-class-password"
              type="text"
              value={newClass.loginPassword}
              onChange={(e) => setNewClass((p) => ({ ...p, loginPassword: e.target.value }))}
              placeholder="Default: class2026"
            />
          </div>
        </div>
        <button
          type="button"
          className="btn btn-green mt-4"
          disabled={addingClass}
          onClick={handleAddClass}
        >
          {addingClass ? "Adding class…" : "+ Add class"}
        </button>
      </section>

      {loading ? (
        <p className="text-AppGray">Loading teacher settings…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classSlugs.map((slug) => (
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
                  placeholder={DEFAULT_STAFF_IDS[slug] || "TCH00X"}
                />
                <p className="text-xs text-AppGray mt-1">
                  Login ID for this class teacher.
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
          New classes get their own teacher dashboard. Set a unique <strong>Staff ID</strong> and
          share it with the class teacher for login.
        </span>
      </div>
    </div>
  );
}
