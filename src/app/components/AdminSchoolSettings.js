"use client";

import { useCallback, useEffect, useState } from "react";
import { useSchoolClasses } from "@/app/context/SchoolClassesContext";
import {
  createSubjectRow,
  fetchAllClassSubjects,
  saveAllClassSubjects,
  saveClassSubjects,
} from "@/lib/classSubjectsClient";
import {
  createStudentRow,
  fetchAllClassStudents,
  saveAllClassStudents,
  saveClassStudents,
} from "@/lib/classStudentsClient";
import {
  DEFAULT_SCHOOL_SETTINGS,
  fetchSchoolSettings,
  saveSchoolSettings,
} from "@/lib/schoolSettingsClient";
import { toast } from "sonner";

function emptyStudentsByClass(classSlugs) {
  return classSlugs.reduce((acc, slug) => {
    acc[slug] = [];
    return acc;
  }, {});
}

function emptySubjectsByClass(classSlugs) {
  return classSlugs.reduce((acc, slug) => {
    acc[slug] = [];
    return acc;
  }, {});
}

export default function AdminSchoolSettings() {
  const { classSlugs } = useSchoolClasses();
  const [schoolForm, setSchoolForm] = useState({ ...DEFAULT_SCHOOL_SETTINGS });
  const [studentsByClass, setStudentsByClass] = useState({});
  const [subjectsByClass, setSubjectsByClass] = useState({});
  const [labels, setLabels] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingSchool, setSavingSchool] = useState(false);
  const [savingSlug, setSavingSlug] = useState(null);
  const [savingSubjectSlug, setSavingSubjectSlug] = useState(null);
  const [savingAllStudents, setSavingAllStudents] = useState(false);
  const [savingAllSubjects, setSavingAllSubjects] = useState(false);

  const load = useCallback(async () => {
    if (!classSlugs.length) return;
    try {
      setLoading(true);
      const [school, classes, subjects] = await Promise.all([
        fetchSchoolSettings(),
        fetchAllClassStudents(),
        fetchAllClassSubjects(),
      ]);

      setSchoolForm({
        schoolName: school.schoolName,
        schoolAddress: school.schoolAddress,
        schoolMotto: school.schoolMotto,
        schoolEmail: school.schoolEmail || "",
        schoolWebsite: school.schoolWebsite || "",
      });

      const nextStudents = emptyStudentsByClass(classSlugs);
      const nextSubjects = emptySubjectsByClass(classSlugs);
      const nextLabels = {};
      for (const slug of classSlugs) {
        nextStudents[slug] = classes[slug]?.students ?? [];
        nextSubjects[slug] = subjects[slug]?.subjects ?? [];
        nextLabels[slug] = classes[slug]?.label || subjects[slug]?.label || slug;
      }
      setStudentsByClass(nextStudents);
      setSubjectsByClass(nextSubjects);
      setLabels(nextLabels);
    } catch (err) {
      toast.error(err?.message || "Failed to load school settings.");
    } finally {
      setLoading(false);
    }
  }, [classSlugs]);

  useEffect(() => {
    load();
  }, [load]);

  const updateSchoolField = (field, value) => {
    setSchoolForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSchool = async () => {
    try {
      setSavingSchool(true);
      await saveSchoolSettings(schoolForm);
      toast.success("School profile saved.");
    } catch (err) {
      toast.error(err?.message || "Failed to save school profile.");
    } finally {
      setSavingSchool(false);
    }
  };

  const updateStudent = (slug, index, field, value) => {
    setStudentsByClass((prev) => {
      const list = [...(prev[slug] || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [slug]: list };
    });
  };

  const addStudent = (slug) => {
    setStudentsByClass((prev) => ({
      ...prev,
      [slug]: [...(prev[slug] || []), createStudentRow()],
    }));
  };

  const removeStudent = (slug, index) => {
    setStudentsByClass((prev) => ({
      ...prev,
      [slug]: (prev[slug] || []).filter((_, i) => i !== index),
    }));
  };

  const updateSubject = (slug, index, name) => {
    setSubjectsByClass((prev) => {
      const list = [...(prev[slug] || [])];
      list[index] = { ...list[index], name };
      return { ...prev, [slug]: list };
    });
  };

  const addSubject = (slug) => {
    setSubjectsByClass((prev) => ({
      ...prev,
      [slug]: [...(prev[slug] || []), createSubjectRow()],
    }));
  };

  const removeSubject = (slug, index) => {
    setSubjectsByClass((prev) => ({
      ...prev,
      [slug]: (prev[slug] || []).filter((_, i) => i !== index),
    }));
  };

  const handleSaveClassSubjects = async (slug) => {
    try {
      setSavingSubjectSlug(slug);
      await saveClassSubjects(slug, subjectsByClass[slug] || []);
      toast.success(`${labels[slug] || slug} subjects saved.`);
    } catch (err) {
      toast.error(err?.message || "Failed to save subjects.");
    } finally {
      setSavingSubjectSlug(null);
    }
  };

  const handleSaveAllSubjects = async () => {
    try {
      setSavingAllSubjects(true);
      const payload = classSlugs.reduce((acc, slug) => {
        acc[slug] = { subjects: subjectsByClass[slug] || [] };
        return acc;
      }, {});
      await saveAllClassSubjects(payload);
      toast.success("All class subjects saved.");
    } catch (err) {
      toast.error(err?.message || "Failed to save all subjects.");
    } finally {
      setSavingAllSubjects(false);
    }
  };

  const handleSaveClassStudents = async (slug) => {
    try {
      setSavingSlug(slug);
      await saveClassStudents(slug, studentsByClass[slug] || []);
      toast.success(`${labels[slug] || slug} student list saved.`);
    } catch (err) {
      toast.error(err?.message || "Failed to save students.");
    } finally {
      setSavingSlug(null);
    }
  };

  const handleSaveAllStudents = async () => {
    try {
      setSavingAllStudents(true);
      const payload = classSlugs.reduce((acc, slug) => {
        acc[slug] = { students: studentsByClass[slug] || [] };
        return acc;
      }, {});
      await saveAllClassStudents(payload);
      toast.success("All class student lists saved.");
    } catch (err) {
      toast.error(err?.message || "Failed to save all students.");
    } finally {
      setSavingAllStudents(false);
    }
  };

  if (loading) {
    return <p className="text-AppGray">Loading school settings…</p>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10">
      <section>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--dark)]">
              School Profile
            </h2>
            <p className="text-sm text-AppGray mt-1">
              These details appear on result slips, the login page, and printed reports.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-green shrink-0"
            disabled={savingSchool}
            onClick={handleSaveSchool}
          >
            {savingSchool ? "Saving…" : "Save school profile"}
          </button>
        </div>

        <div className="card max-w-2xl space-y-4">
          <div className="form-field">
            <label htmlFor="school-name">School name</label>
            <input
              id="school-name"
              type="text"
              value={schoolForm.schoolName}
              onChange={(e) => updateSchoolField("schoolName", e.target.value)}
              placeholder="e.g. Ayodele Schools"
            />
          </div>
          <div className="form-field">
            <label htmlFor="school-address">School address</label>
            <textarea
              id="school-address"
              rows={3}
              value={schoolForm.schoolAddress}
              onChange={(e) => updateSchoolField("schoolAddress", e.target.value)}
              placeholder="Full school address"
            />
          </div>
          <div className="form-field">
            <label htmlFor="school-motto">School motto</label>
            <input
              id="school-motto"
              type="text"
              value={schoolForm.schoolMotto}
              onChange={(e) => updateSchoolField("schoolMotto", e.target.value)}
              placeholder="e.g. Knowledge, Character, Excellence."
            />
          </div>
          <div className="form-field">
            <label htmlFor="school-email">School email (on result slip)</label>
            <input
              id="school-email"
              type="email"
              value={schoolForm.schoolEmail || ""}
              onChange={(e) => updateSchoolField("schoolEmail", e.target.value)}
              placeholder="e.g. info@school.edu.ng"
            />
          </div>
          <div className="form-field">
            <label htmlFor="school-website">School website (on result slip)</label>
            <input
              id="school-website"
              type="text"
              value={schoolForm.schoolWebsite || ""}
              onChange={(e) => updateSchoolField("schoolWebsite", e.target.value)}
              placeholder="e.g. www.school.edu.ng"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--dark)]">
              Subjects by Class
            </h2>
            <p className="text-sm text-AppGray mt-1">
              Add subjects for each class. They appear automatically when teachers enter
              results.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-green shrink-0"
            disabled={savingAllSubjects || savingSubjectSlug !== null}
            onClick={handleSaveAllSubjects}
          >
            {savingAllSubjects ? "Saving all…" : "Save all subjects"}
          </button>
        </div>

        <div className="grid gap-6 mb-10">
          {classSlugs.map((slug) => {
            const subjects = subjectsByClass[slug] || [];
            return (
              <div key={`sub-${slug}`} className="card admin-teacher-card">
                <div className="admin-teacher-card-head mb-4">
                  <span className="admin-class-card-label">{labels[slug]}</span>
                  <span className="text-xs text-AppGray">
                    {subjects.length} subject{subjects.length === 1 ? "" : "s"}
                  </span>
                </div>
                {subjects.length === 0 ? (
                  <p className="text-sm text-AppGray mb-3">No subjects yet.</p>
                ) : (
                  <ul className="space-y-2 mb-3">
                    {subjects.map((subject, index) => (
                      <li key={subject.id} className="flex gap-2">
                        <input
                          type="text"
                          value={subject.name}
                          onChange={(e) => updateSubject(slug, index, e.target.value)}
                          placeholder="e.g. English Studies"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          className="btn btn-outline btn-sm shrink-0"
                          onClick={() => removeSubject(slug, index)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => addSubject(slug)}
                  >
                    + Add subject
                  </button>
                  <button
                    type="button"
                    className="btn btn-green btn-sm"
                    disabled={savingSubjectSlug === slug || savingAllSubjects}
                    onClick={() => handleSaveClassSubjects(slug)}
                  >
                    {savingSubjectSlug === slug ? "Saving…" : `Save ${labels[slug]}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--dark)]">
              Register Students by Class
            </h2>
            <p className="text-sm text-AppGray mt-1">
              Add every student for each class. Teachers can pick registered students when
              entering results.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-green shrink-0"
            disabled={savingAllStudents || savingSlug !== null}
            onClick={handleSaveAllStudents}
          >
            {savingAllStudents ? "Saving all…" : "Save all classes"}
          </button>
        </div>

        <div className="grid gap-6">
          {classSlugs.map((slug) => {
            const students = studentsByClass[slug] || [];
            return (
              <div key={slug} className="card admin-teacher-card">
                <div className="admin-teacher-card-head mb-4">
                  <span className="admin-class-card-label">{labels[slug]}</span>
                  <span className="text-xs text-AppGray">
                    {students.length} student{students.length === 1 ? "" : "s"}
                  </span>
                </div>

                {students.length === 0 ? (
                  <p className="text-sm text-AppGray mb-3">No students registered yet.</p>
                ) : (
                  <div className="overflow-x-auto mb-3">
                    <table className="stbl w-full text-sm">
                      <thead>
                        <tr>
                          <th>Full name</th>
                          <th>Admission no.</th>
                          <th>Gender</th>
                          <th aria-label="Actions" />
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, index) => (
                          <tr key={student.id}>
                            <td>
                              <input
                                type="text"
                                value={student.name}
                                onChange={(e) =>
                                  updateStudent(slug, index, "name", e.target.value)
                                }
                                placeholder="Student full name"
                                className="w-full min-w-[140px]"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={student.admissionNo}
                                onChange={(e) =>
                                  updateStudent(slug, index, "admissionNo", e.target.value)
                                }
                                placeholder="e.g. ADM001"
                                className="w-full min-w-[100px]"
                              />
                            </td>
                            <td>
                              <select
                                value={student.gender}
                                onChange={(e) =>
                                  updateStudent(slug, index, "gender", e.target.value)
                                }
                              >
                                <option>Female</option>
                                <option>Male</option>
                              </select>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => removeStudent(slug, index)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => addStudent(slug)}
                  >
                    + Add student
                  </button>
                  <button
                    type="button"
                    className="btn btn-green btn-sm"
                    disabled={savingSlug === slug || savingAllStudents}
                    onClick={() => handleSaveClassStudents(slug)}
                  >
                    {savingSlug === slug ? "Saving…" : `Save ${labels[slug]}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="admin-banner">
        <span>💡</span>
        <span>
          Save subjects per class first, then register students. Teachers will see subjects
          pre-filled on the result entry page, and PDF slips use the official sheet layout.
        </span>
      </div>
    </div>
  );
}
