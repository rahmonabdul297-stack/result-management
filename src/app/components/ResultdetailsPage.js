"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ResultSlipA4 from "@/app/components/ResultSlipA4";
import ClassTeacherWelcome from "@/app/components/ClassTeacherWelcome";
import { submitStudentResult } from "@/lib/resultApiClient";
import { getClassConfig } from "@/lib/classConfig";
import {
  fetchClassSubjects,
  subjectsToResultRows,
} from "@/lib/classSubjectsClient";
import { fetchClassStudents } from "@/lib/classStudentsClient";
import { fetchClassTeacher } from "@/lib/classTeachersClient";
import {
  getGrade,
  getRemark,
  TRAIT_LETTER_GRADES,
} from "@/lib/resultGrading";
import {
  BEHAVIOUR_TRAITS,
  DEFAULT_TRAIT_GRADE,
  PSYCHOMOTOR_TRAITS,
} from "@/lib/resultSlipConstants";
import {
  DEFAULT_SCHOOL_SETTINGS,
  fetchSchoolSettings,
} from "@/lib/schoolSettingsClient";
import { toast } from "sonner";

const TERMS = ["1st", "2nd", "3rd"];

const makeRow = (id) => ({
  id,
  subject: "",
  ca: "",
  mid: "",
  exam: "",
  classAvg: "",
});
const toNum = (v) => (v === "" ? 0 : Number(v) || 0);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function initTraitMap(traits) {
  return traits.reduce((a, t) => ({ ...a, [t]: DEFAULT_TRAIT_GRADE }), {});
}

export default function ResultdetailsPage({ classSlug = "classone" }) {
  const classConfig = getClassConfig(classSlug);
  const rowIdRef = useRef(2);
  const fileRef = useRef(null);
  const classSubjectsRef = useRef([]);

  const [form, setForm] = useState({
    schoolName: DEFAULT_SCHOOL_SETTINGS.schoolName,
    schoolAddress: DEFAULT_SCHOOL_SETTINGS.schoolAddress,
    schoolTagline: DEFAULT_SCHOOL_SETTINGS.schoolMotto,
    term: "1st",
    selectedSession: "2025/2026",
    name: "",
    admissionNo: "",
    gender: "Female",
    className: classConfig.className,
    age: "",
    discipline: classConfig.className,
    house: "",
    weightBegin: "",
    heightBegin: "",
    weightEnd: "",
    heightEnd: "",
    classSize: "30",
    academicSession: "2025/2026",
    position: "SATISFACTORY",
    nextBegin: "",
    nextEnd: "",
    fees: "",
    teacherName: "",
    houseRemark: "",
    principalRemark: "",
    dateSigned: "",
  });

  const [rows, setRows] = useState([makeRow("row-1")]);
  const [passport, setPassport] = useState("");
  const [status, setStatus] = useState("");
  const [defaultTeacherName, setDefaultTeacherName] = useState("");
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [configuredSubjectCount, setConfiguredSubjectCount] = useState(0);
  const [schoolSettings, setSchoolSettings] = useState(DEFAULT_SCHOOL_SETTINGS);

  useEffect(() => {
    let active = true;
    fetchSchoolSettings()
      .then((settings) => {
        if (!active) return;
        setSchoolSettings(settings);
        setForm((prev) => ({
          ...prev,
          schoolName: settings.schoolName,
          schoolAddress: settings.schoolAddress,
          schoolTagline: settings.schoolMotto,
        }));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchClassSubjects(classSlug)
      .then((record) => {
        if (!active) return;
        const subjects = record?.subjects ?? [];
        classSubjectsRef.current = subjects;
        setConfiguredSubjectCount(subjects.length);
        const nextRows = subjectsToResultRows(subjects, makeRow);
        setRows(nextRows);
        rowIdRef.current = nextRows.length + 2;
      })
      .catch(() => {
        if (active) {
          classSubjectsRef.current = [];
          setConfiguredSubjectCount(0);
          setRows([makeRow("row-1")]);
        }
      });
    return () => {
      active = false;
    };
  }, [classSlug]);

  useEffect(() => {
    let active = true;
    fetchClassStudents(classSlug)
      .then((record) => {
        if (!active) return;
        setRegisteredStudents(record?.students ?? []);
      })
      .catch(() => {
        if (active) setRegisteredStudents([]);
      });
    return () => {
      active = false;
    };
  }, [classSlug]);

  useEffect(() => {
    let active = true;
    fetchClassTeacher(classSlug)
      .then((record) => {
        if (!active) return;
        const name = record?.teacherName?.trim() || "";
        setDefaultTeacherName(name);
        if (name) {
          setForm((prev) => (prev.teacherName ? prev : { ...prev, teacherName: name }));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [classSlug]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [behaviour, setBehaviour] = useState(() => initTraitMap(BEHAVIOUR_TRAITS));
  const [psych, setPsych] = useState(() => initTraitMap(PSYCHOMOTOR_TRAITS));

  const computed = useMemo(
    () =>
      rows.map((r) => {
        const total = clamp(toNum(r.ca) + toNum(r.mid) + toNum(r.exam), 0, 100);
        return {
          ...r,
          total,
          grade: getGrade(total),
          remark: getRemark(total),
        };
      }),
    [rows],
  );

  const summary = useMemo(() => {
    const active = computed.filter((r) => r.subject.trim());
    const total = active.reduce((s, r) => s + r.total, 0);
    const avg = active.length ? total / active.length : 0;
    return { count: active.length, total, avg, grade: getGrade(avg) };
  }, [computed]);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateRow = (id, key, value, max = 100) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id !== id
          ? r
          : {
              ...r,
              [key]:
                key === "subject"
                  ? value
                  : value === ""
                    ? ""
                    : String(clamp(toNum(value), 0, max)),
            },
      ),
    );

  const onPassport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPassport(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const addRow = () => {
    const id = `row-${rowIdRef.current}`;
    rowIdRef.current += 1;
    setRows((prev) => [...prev, makeRow(id)]);
  };

  const removeRow = (id) =>
    setRows((prev) =>
      prev.length === 1 ? prev : prev.filter((x) => x.id !== id),
    );

  const submit = async () => {
    if (!form.name.trim() || !form.admissionNo.trim()) {
      const msg = "Student name and admission number are required.";
      setStatus(msg);
      toast.error(msg);
      return;
    }

    const payload = {
      ...form,
      rows: computed,
      summary,
      behaviour,
      psych,
      passport,
      classSlug,
    };

    try {
      setIsSubmitting(true);
      await submitStudentResult(payload);
      const msg = "Result submitted successfully.";
      setStatus(msg);
      toast.success(msg);
    } catch (error) {
      const msg = error?.message || "Failed to submit result.";
      setStatus(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setForm((prev) => ({
      ...prev,
      name: "",
      admissionNo: "",
      teacherName: defaultTeacherName,
      houseRemark: "",
      principalRemark: "",
      dateSigned: "",
    }));
    setRows(subjectsToResultRows(classSubjectsRef.current, makeRow));
    rowIdRef.current = (classSubjectsRef.current?.length || 0) + 2;
    setPassport("");
    if (fileRef.current) fileRef.current.value = "";
    setStatus("Form cleared.");
    toast.info("Form cleared.");
  };

  return (
    <>
      <div className="resultdetails-page page-content overflow-y-auto w-full">
        <div className="page">
          <div className="mb-6">
            <ClassTeacherWelcome
              classSlug={classSlug}
              subtitle={`Enter student result slips for ${classConfig.label}. Use Preview to view the printable slip.`}
            />
            {status ? (
              <p className="mt-2 text-sm" style={{ color: "var(--green)" }}>
                {status}
              </p>
            ) : null}
          </div>

        

          <div className="card">
            <div className="card-title">Student Information</div>
            {registeredStudents.length > 0 ? (
              <div className="form-field mb-4">
                  <label>Select registered student</label>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const picked = registeredStudents.find(
                        (s) => s.id === e.target.value,
                      );
                      if (!picked) return;
                      setForm((prev) => ({
                        ...prev,
                        name: picked.name,
                        admissionNo: picked.admissionNo,
                        gender: picked.gender || prev.gender,
                      }));
                      e.target.value = "";
                    }}
                  >
                    <option value="">— Choose from class register —</option>
                    {registeredStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.admissionNo})
                      </option>
                    ))}
                  </select>
              </div>
            ) : null}
            <div className="form-row four">
              <div className="form-field">
                <label>Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Admission No</label>
                <input
                  value={form.admissionNo}
                  onChange={(e) => setField("admissionNo", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setField("gender", e.target.value)}
                >
                  <option>Female</option>
                  <option>Male</option>
                </select>
              </div>
              <div className="form-field">
                <label>Class</label>
                <input
                  value={form.className}
                  onChange={(e) => setField("className", e.target.value)}
                />
              </div>
            </div>
            <div className="form-row four">
              <div className="form-field">
                <label>Term</label>
                <select
                  value={form.term}
                  onChange={(e) => setField("term", e.target.value)}
                >
                  {TERMS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Academic Session</label>
                <input
                  value={form.academicSession}
                  onChange={(e) => setField("academicSession", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Age</label>
                <input
                  value={form.age}
                  onChange={(e) => setField("age", e.target.value)}
                  placeholder="e.g. 6 YEARS"
                />
              </div>
              <div className="form-field">
                <label>Grade / Stream</label>
                <input
                  value={form.discipline}
                  onChange={(e) => setField("discipline", e.target.value)}
                  placeholder="e.g. Junior 2 CORAL"
                />
              </div>
              <div className="form-field">
                <label>House</label>
                <input
                  value={form.house}
                  onChange={(e) => setField("house", e.target.value)}
                />
              </div>
            </div>
            <div className="form-row four">
              <div className="form-field">
                <label>No. in Class</label>
                <input
                  type="number"
                  min="1"
                  value={form.classSize}
                  onChange={(e) => setField("classSize", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Position</label>
                <input
                  value={form.position}
                  onChange={(e) => setField("position", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Next Term Begins</label>
                <input
                  type="date"
                  value={form.nextBegin}
                  onChange={(e) => setField("nextBegin", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Next Term Ends</label>
                <input
                  type="date"
                  value={form.nextEnd}
                  onChange={(e) => setField("nextEnd", e.target.value)}
                />
              </div>
            </div>
            <div className="form-row three">
              <div className="form-field">
                <label>Fees (N)</label>
                <input
                  type="number"
                  value={form.fees}
                  onChange={(e) => setField("fees", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Submitted By</label>
                <input
                  value={form.teacherName}
                  onChange={(e) => setField("teacherName", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Passport</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onPassport}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Subject Scores</div>
            <div className="table-wrap">
              <table className="stbl">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>CA 20%</th>
                    <th>CA 20%</th>
                    <th>Exam 60%</th>
                    <th>Total</th>
                    <th>Class Avg</th>
                    <th>Grade</th>
                    <th>Remark</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {computed.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <input
                          value={r.subject}
                          onChange={(e) =>
                            updateRow(r.id, "subject", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={r.ca}
                          onChange={(e) =>
                            updateRow(r.id, "ca", e.target.value, 20)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={r.mid}
                          onChange={(e) =>
                            updateRow(r.id, "mid", e.target.value, 20)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={r.exam}
                          onChange={(e) =>
                            updateRow(r.id, "exam", e.target.value, 60)
                          }
                        />
                      </td>
                      <td>{r.total}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={r.classAvg}
                          onChange={(e) =>
                            updateRow(r.id, "classAvg", e.target.value, 100)
                          }
                        />
                      </td>
                      <td>{r.grade}</td>
                      <td>{r.remark}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => removeRow(r.id)}
                        >
                          x
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <span>
                Subjects: <strong>{summary.count}</strong>
              </span>
              <span>
                Total: <strong>{summary.total}</strong>
              </span>
              <span>
                Average: <strong>{summary.avg.toFixed(1)}</strong>
              </span>
              <span>
                Grade: <strong>{summary.grade}</strong>
              </span>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ marginTop: 8 }}
              onClick={addRow}
            >
              + Add extra subject
            </button>
            {configuredSubjectCount > 0 ? (
              <p className="text-xs text-AppGray mt-2">
                {configuredSubjectCount} subject
                {configuredSubjectCount === 1 ? "" : "s"} loaded from admin settings for{" "}
                {classConfig.label}.
              </p>
            ) : null}
          </div>

          <div className="card">
            <div className="card-title">Physical development</div>
            <div className="form-row four">
              <div className="form-field">
                <label>Weight begin (kg)</label>
                <input
                  value={form.weightBegin}
                  onChange={(e) => setField("weightBegin", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Height begin (m)</label>
                <input
                  value={form.heightBegin}
                  onChange={(e) => setField("heightBegin", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Weight end (kg)</label>
                <input
                  value={form.weightEnd}
                  onChange={(e) => setField("weightEnd", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Height end (m)</label>
                <input
                  value={form.heightEnd}
                  onChange={(e) => setField("heightEnd", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Traits & Remarks</div>
            <div className="form-row two">
              <div className="form-field">
                <label>Behavioural traits</label>
                {BEHAVIOUR_TRAITS.map((t) => (
                  <div
                    key={t}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span>{t}</span>
                    <select
                      value={behaviour[t]}
                      onChange={(e) =>
                        setBehaviour((p) => ({ ...p, [t]: e.target.value }))
                      }
                    >
                      {TRAIT_LETTER_GRADES.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="form-field">
                <label>Psychomotor</label>
                {PSYCHOMOTOR_TRAITS.map((t) => (
                  <div
                    key={t}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span>{t}</span>
                    <select
                      value={psych[t]}
                      onChange={(e) =>
                        setPsych((p) => ({ ...p, [t]: e.target.value }))
                      }
                    >
                      {TRAIT_LETTER_GRADES.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-row two">
              <div className="form-field">
                <label>Class Teacher&apos;s Comment</label>
                <textarea
                  rows={2}
                  value={form.houseRemark}
                  onChange={(e) => setField("houseRemark", e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Principal Remark</label>
                <textarea
                  rows={2}
                  value={form.principalRemark}
                  onChange={(e) => setField("principalRemark", e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Date Signed</label>
                <input
                  type="date"
                  value={form.dateSigned}
                  onChange={(e) => setField("dateSigned", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="btn-row">
            <button
              type="button"
              className="btn btn-green"
              onClick={submit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              className="btn btn-gold"
              onClick={() => window.print()}
            >
              Preview Result Slip
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={clearForm}
            >
              Clear Form
            </button>
          </div>
        </div>
        <section className="result-slip-print">
          <ResultSlipA4
            data={{
              ...form,
              rows: computed,
              summary,
              behaviour,
              psych,
              passport,
            }}
            school={schoolSettings}
          />
        </section>
      </div>
      <style jsx global>{`
        .resultdetails-page .table-wrap {
          width: 100%;
          overflow-x: auto;
        }
        .resultdetails-page .stbl {
          min-width: 760px;
        }
        @media (max-width: 768px) {
          .resultdetails-page .form-row,
          .resultdetails-page .form-row.two,
          .resultdetails-page .form-row.three,
          .resultdetails-page .form-row.four,
          .resultdetails-page .beh-grid,
          .resultdetails-page .slip-grid,
          .resultdetails-page .slip-summary,
          .resultdetails-page .slip-cols {
            grid-template-columns: 1fr !important;
          }
          .resultdetails-page .card {
            padding: 1rem;
          }
          .resultdetails-page .btn-row {
            justify-content: center;
          }
        }

        .result-slip-print {
          display: none;
        }
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html,
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden;
          }
          .result-slip-print,
          .result-slip-print * {
            visibility: visible;
          }
          header,
          .dashboard-sidebar,
          .dashboard-content > :not(.resultdetails-page),
          .resultdetails-page .page {
            display: none !important;
          }
          .resultdetails-page {
            padding: 0 !important;
            margin: 0 !important;
            background: #fff !important;
          }
          .page {
            display: none !important;
          }
          .result-slip-print {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            overflow: hidden !important;
          }
          .result-slip-print .a4-scale-spacer {
            height: auto !important;
            overflow: visible !important;
          }
          .result-slip-print .a4-scale-inner {
            transform: none !important;
          }
          .result-slip-print .a4-sheet-outer,
          .result-slip-print .a4-sheet {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </>
  );
}
