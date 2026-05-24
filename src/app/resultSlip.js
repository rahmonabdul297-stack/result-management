"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ResultSlipA4 from "@/app/components/ResultSlipA4";
import { submitStudentResult } from "@/lib/resultApiClient";
import {
  DEFAULT_SCHOOL_SETTINGS,
  fetchSchoolSettings,
} from "@/lib/schoolSettingsClient";
import { toast } from "sonner";
import { IoIosContact } from "react-icons/io";
const TERMS = ["1st", "2nd", "3rd"];
const TRAITS = ["Excellent", "Very Good", "Good", "Fair", "Poor"];
const BEHAVIOUR = ["Punctuality", "Neatness", "Attentiveness", "Obedience"];
const PSYCHOMOTOR = ["Handwriting", "Sports", "Creativity", "Practical Skills"];

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
const getGrade = (s) =>
  s >= 75
    ? "A"
    : s >= 65
      ? "B"
      : s >= 55
        ? "C"
        : s >= 45
          ? "D"
          : s >= 40
            ? "E"
            : "F";
const getRemark = (s) =>
  s >= 75
    ? "Excellent"
    : s >= 65
      ? "Very Good"
      : s >= 55
        ? "Good"
        : s >= 45
          ? "Fair"
          : s >= 40
            ? "Pass"
            : "Needs Improvement";

export default function ResultSlip() {
  const rowIdRef = useRef(2);
  const [isPreview, setIsPreview] = useState(false);
  const [form, setForm] = useState({
    term: "1st",
    selectedSession: "2025/2026",
    name: "",
    admissionNo: "",
    gender: "Female",
    className: "JSS 1",
    discipline: "JNR. SCH. 2 DISCIPLINE",
    house: "NASARAWA",
    classSize: "30",
    academicSession: "2025/2026",
    position: "SATISFACTORY",
    nextBegin: "",
    nextEnd: "",
    fees: "43000",
    teacherName: "",
    houseRemark: "",
    principalRemark: "",
    dateSigned: "",
  });

  const [rows, setRows] = useState([makeRow("row-1")]);
  const [passport, setPassport] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [behaviour, setBehaviour] = useState(
    BEHAVIOUR.reduce((a, t) => ({ ...a, [t]: "Good" }), {}),
  );
  const [psych, setPsych] = useState(
    PSYCHOMOTOR.reduce((a, t) => ({ ...a, [t]: "Good" }), {}),
  );
  const fileRef = useRef(null);
  const [schoolSettings, setSchoolSettings] = useState(DEFAULT_SCHOOL_SETTINGS);

  useEffect(() => {
    let active = true;
    fetchSchoolSettings()
      .then((settings) => {
        if (active) setSchoolSettings(settings);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

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
      classSlug: "classone",
    };
    try {
      setIsSubmitting(true);
      await submitStudentResult(payload);
      const msg = "Saved to Firebase.";
      setStatus(msg);
      toast.success(msg);
    } catch (error) {
      const msg = error?.message || "Failed to save result.";
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
      teacherName: "",
      houseRemark: "",
      principalRemark: "",
      dateSigned: "",
    }));
    setRows([makeRow("row-1")]);
    setPassport("");
    if (fileRef.current) fileRef.current.value = "";
    setStatus("Form cleared.");
    toast.info("Form cleared.");
  };

  const previewPDF = () => {
    setIsPreview(true);
  };

  useEffect(() => {
    if (isPreview) {
      document.body.classList.add("result-slip-preview-mode");
    } else {
      document.body.classList.remove("result-slip-preview-mode");
    }

    return () => {
      document.body.classList.remove("result-slip-preview-mode");
    };
  }, [isPreview]);

  return (
    <>
      <div className={`overflow-y-auto w-full ${isPreview ? "p-0" : "p-10"}`}>
        {!isPreview ? (
          <div className="page">
            <div className="ph">
              <h2>Enter Student Result</h2>
              <p>
                Select a term, complete all fields - grades are calculated live.
              </p>
              {status ? (
                <p style={{ marginTop: 6, color: "#0f766e" }}>{status}</p>
              ) : null}
            </div>

            <div className="card">
              <div className="form-row">
                <div className="form-field">
                  <label>Academic Session</label>
                  <input
                    value={form.selectedSession}
                    onChange={(e) =>
                      setField("selectedSession", e.target.value)
                    }
                  />
                </div>
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
              </div>
            </div>

            <div className="card">
              <div className="card-title">Student Details</div>
              <div className="form-row three">
                <div className="form-field">
                  <label>Student Full Name</label>
                  <input
                    value={form.name}
                    placeholder="Enter Student Full Name"
                    onChange={(e) => setField("name", e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Admission Number</label>
                  <input
                    value={form.admissionNo}
                    placeholder="Enter Student Admission Number"
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
              </div>
              <div className="form-row four">
                <div className="form-field">
                  <label>Class</label>
                  <input
                    value={form.className}
                    onChange={(e) => setField("className", e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Discipline</label>
                  <input
                    value={form.discipline}
                    onChange={(e) => setField("discipline", e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>House</label>
                  <input
                    value={form.house}
                    onChange={(e) => setField("house", e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>No. in Class</label>
                  <input
                    type="number"
                    min="1"
                    value={form.classSize}
                    onChange={(e) => setField("classSize", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row four">
                <div className="form-field">
                  <label>Academic Session</label>
                  <input
                    value={form.academicSession}
                    onChange={(e) =>
                      setField("academicSession", e.target.value)
                    }
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
              <div className="form-row">
                <div className="form-field">
                  <label>3rd Term Fees (N)</label>
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
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Student Passport</label>
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
              <table className="stbl">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>CA</th>
                    <th>Mid</th>
                    <th>Exam</th>
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
                          onClick={() =>
                            setRows((p) =>
                              p.length === 1
                                ? p
                                : p.filter((x) => x.id !== r.id),
                            )
                          }
                        >
                          x
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 10, display: "flex", gap: 16 }}>
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
                onClick={() => {
                  const id = `row-${rowIdRef.current}`;
                  rowIdRef.current += 1;
                  setRows((p) => [...p, makeRow(id)]);
                }}
              >
                + Add Subject Row
              </button>
            </div>

            <div className="card">
              <div className="card-title">Behaviour Traits</div>
              <div className="beh-grid">
                {BEHAVIOUR.map((t) => (
                  <div className="form-field" key={t}>
                    <label>{t}</label>
                    <select
                      value={behaviour[t]}
                      onChange={(e) =>
                        setBehaviour((p) => ({ ...p, [t]: e.target.value }))
                      }
                    >
                      {TRAITS.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-title">Psychomotor Skills</div>
              <div className="beh-grid">
                {PSYCHOMOTOR.map((t) => (
                  <div className="form-field" key={t}>
                    <label>{t}</label>
                    <select
                      value={psych[t]}
                      onChange={(e) =>
                        setPsych((p) => ({ ...p, [t]: e.target.value }))
                      }
                    >
                      {TRAITS.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-title">Remarks & Comments</div>
              <div className="form-row">
                <div className="form-field">
                  <label>House Master/Mistress Remark</label>
                  <textarea
                    rows={2}
                    value={form.houseRemark}
                    onChange={(e) => setField("houseRemark", e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Principal's Remark</label>
                  <textarea
                    rows={2}
                    value={form.principalRemark}
                    onChange={(e) =>
                      setField("principalRemark", e.target.value)
                    }
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

            <div className="btn-row" style={{ justifyContent: "center" }}>
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
                onClick={previewPDF}
              >
                Preview PDF
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
        ) : (
          <section
            className="result-slip-print"
            style={{
              display: "block",
              margin: "0 auto",
              maxWidth: 980,
              background: "#fff",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsPreview(false)}
              >
                Back to Form
              </button>
              <button
                type="button"
                className="btn btn-gold"
                onClick={() => window.print()}
              >
                Print Slip
              </button>
            </div>
            <div className="result-slip-print-visible">
              <ResultSlipA4
                data={{
                  ...form,
                  rows: computed,
                  summary,
                  behaviour,
                  psych,
                  passport,
                  schoolName: schoolSettings.schoolName,
                  schoolAddress: schoolSettings.schoolAddress,
                  schoolTagline: schoolSettings.schoolMotto,
                }}
                school={schoolSettings}
              />
            </div>
          </section>
        )}
      </div>

      <style jsx global>{`
        body.result-slip-preview-mode header {
          display: none !important;
        }
        body.result-slip-preview-mode section > div.fixed {
          display: none !important;
        }
        body.result-slip-preview-mode
          section
          > div.flex.items-center.justify-center.w-full {
          width: 100% !important;
          margin-left: 0 !important;
          padding-top: 0 !important;
        }
      `}</style>
    </>
  );
}
