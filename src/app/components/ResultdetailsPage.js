"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Logo from "@/app/logo";
import Schoolname from "@/app/schoolname";
import ClassTeacherWelcome from "@/app/components/ClassTeacherWelcome";
import { submitStudentResult } from "@/lib/resultApiClient";
import { getClassConfig } from "@/lib/classConfig";
import { fetchClassTeacher } from "@/lib/classTeachersClient";
import { toast } from "sonner";
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

export default function ResultdetailsPage({ classSlug = "classone" }) {
  const classConfig = getClassConfig(classSlug);
  const rowIdRef = useRef(2);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    schoolName: "BRIGHT WISDOM INTERNATIONAL ACADEMY",
    schoolAddress: "12 Unity Road, Kaduna, Nigeria",
    schoolTagline: "Knowledge, Character, Excellence",
    term: "1st",
    selectedSession: "2025/2026",
    name: "",
    admissionNo: "",
    gender: "Female",
    className: classConfig.className,
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
  const [defaultTeacherName, setDefaultTeacherName] = useState("");

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
  const [behaviour, setBehaviour] = useState(
    BEHAVIOUR.reduce((a, t) => ({ ...a, [t]: "Good" }), {}),
  );
  const [psych, setPsych] = useState(
    PSYCHOMOTOR.reduce((a, t) => ({ ...a, [t]: "Good" }), {}),
  );

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
    setRows([makeRow("row-1")]);
    setPassport("");
    if (fileRef.current) fileRef.current.value = "";
    setStatus("Form cleared.");
    toast.info("Form cleared.");
  };

  return (
    <>
      <div className="resultdetails-page overflow-y-auto w-full p-3 sm:p-6 lg:p-10">
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
              + Add Subject Row
            </button>
          </div>

          <div className="card">
            <div className="card-title">Traits & Remarks</div>
            <div className="form-row two">
              <div className="form-field">
                <label>Behaviour</label>
                {BEHAVIOUR.map((t) => (
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
                      {TRAITS.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="form-field">
                <label>Psychomotor</label>
                {PSYCHOMOTOR.map((t) => (
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
                      {TRAITS.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-row two">
              <div className="form-field">
                <label>House Master/Mistress Remark</label>
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
        {/* result slip print */}

        <section className="result-slip-print">
          <div className="slip-head ">
            <div className="h-[150px] w-[150px]">
              <Logo />
            </div>
            <div className="slip-title">
              <div className="text-3xl uppercase text-AppGreen py-4">
                {" "}
                <Schoolname />
              </div>
              <p>{form.schoolAddress || "-"}</p>
              <div className="flex items-center justify-center">
                <div className="font-bold">{"MOTTO:"}</div>
                {form.schoolTagline || "-"}
              </div>
              <h2>STUDENT RESULT SLIP ({form.term} TERM)</h2>
            </div>
            <div className="slip-pass h-[250px]">
              {passport ? <img src={passport} alt="passport" /> : "PHOTO"}
            </div>
          </div>

          <div className="slip-grid">
            <div>
              <strong>Name:</strong> {form.name || "-"}
            </div>
            <div>
              <strong>Adm No:</strong> {form.admissionNo || "-"}
            </div>
            <div>
              <strong>Gender:</strong> {form.gender}
            </div>
            <div>
              <strong>Class:</strong> {form.className}
            </div>
            <div>
              <strong>Session:</strong> {form.academicSession}
            </div>
            <div>
              <strong>House:</strong> {form.house}
            </div>
            <div>
              <strong>Discipline:</strong> {form.discipline}
            </div>
            <div>
              <strong>No. in Class:</strong> {form.classSize}
            </div>
            <div>
              <strong>Position:</strong> {form.position}
            </div>
            <div>
              <strong>Fees:</strong> N{form.fees || "0"}
            </div>
            <div>
              <strong>Teacher:</strong> {form.teacherName || "-"}
            </div>
            <div>
              <strong>Date Signed:</strong> {form.dateSigned || "-"}
            </div>
            <div>
              <strong>Next Term Begins:</strong> {form.nextBegin || "-"}
            </div>
            <div>
              <strong>Next Term Ends:</strong> {form.nextEnd || "-"}
            </div>
            <div>
              <strong>Selected Session:</strong> {form.selectedSession}
            </div>
          </div>

          <table className="slip-table">
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
              </tr>
            </thead>
            <tbody>
              {computed.filter((r) => r.subject.trim()).length ? (
                computed
                  .filter((r) => r.subject.trim())
                  .map((r) => (
                    <tr key={`print-${r.id}`}>
                      <td>{r.subject}</td>
                      <td>{r.ca || 0}</td>
                      <td>{r.mid || 0}</td>
                      <td>{r.exam || 0}</td>
                      <td>{r.total}</td>
                      <td>{r.classAvg || 0}</td>
                      <td>{r.grade}</td>
                      <td>{r.remark}</td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center" }}>
                    No subjects entered
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="slip-summary">
            <div>
              <strong>Subjects:</strong> {summary.count}
            </div>
            <div>
              <strong>Total:</strong> {summary.total}
            </div>
            <div>
              <strong>Average:</strong> {summary.avg.toFixed(2)}
            </div>
            <div>
              <strong>Overall Grade:</strong> {summary.grade}
            </div>
          </div>

          <div className="slip-cols">
            <div>
              <h4>Behaviour</h4>
              {BEHAVIOUR.map((t) => (
                <p key={`b-${t}`}>
                  {t}: {behaviour[t]}
                </p>
              ))}
            </div>
            <div>
              <h4>Psychomotor</h4>
              {PSYCHOMOTOR.map((t) => (
                <p key={`p-${t}`}>
                  {t}: {psych[t]}
                </p>
              ))}
            </div>
          </div>

          <div className="slip-remarks flex justify-between mt-20">
            <div className="flex flex-col">
              <strong className="font-bold capitalize">
                class teacher remark:
              </strong>
              <div className="py-2 border-b border-gray-300">
                {form.houseRemark || "-"}
              </div>
            </div>
            <div className="flex flex-col">
              <strong className="font-bold capitalize">
                Principal remark:
              </strong>
              <div className="py-2 border-b border-gray-300">
                {form.principalRemark || "-"}
              </div>
            </div>
          </div>

          <div className="flex justify-between font-sans py-10">
            <div className="capitalize font-bold">
              class teacher signature <br />{" "}
              <span className="text-xs">
                ............................................
              </span>
            </div>
            <div className="capitalize font-bold">
              principal signature <br />{" "}
              <span className="text-xs">
                ............................................
              </span>
            </div>
          </div>
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
          html,
          body {
            background: #fff !important;
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
            width: 210mm;
            min-height: max-content;
            margin: 0 auto;
            padding: 12mm;
            background: #fff;
            color: #111;
            font:
              12px "DM Sans",
              Arial,
              sans-serif;
          }
          .slip-head {
            display: grid;
            grid-template-columns: 68px 1fr 68px;
            gap: 10px;
            align-items: center;
            border-bottom: 3px solid var(--green);
            padding-bottom: 8px;
          }
          .slip-logo,
          .slip-pass {
            width: 68px;
            height: 68px;
            border: 1px solid var(--gm);
            display: grid;
            place-items: center;
            font-weight: 700;
            color: var(--green);
          }
          .slip-pass img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .slip-title h1 {
            margin: 0;
            text-align: center;
            font-size: 15px;
            color: var(--green);
          }
          .slip-title h2 {
            margin: 4px 0 0;
            text-align: center;
            font-size: 12px;
            color: var(--gold);
          }
          .slip-title p {
            margin: 1px 0;
            text-align: center;
          }
          .slip-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px 10px;
            margin-top: 8px;
          }
          .slip-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            font-size: 11px;
          }
          .slip-table th,
          .slip-table td {
            border: 1px solid #475569;
            padding: 4px 5px;
          }
          .slip-table thead th {
            background: var(--gl);
            color: var(--gd);
          }
          .slip-summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-top: 8px;
          }
          .slip-summary div {
            border: 1px solid #cbd5e1;
            padding: 6px;
            background: #f8fafc;
          }
          .slip-cols {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 10px;
          }
          .slip-cols h4 {
            margin: 0 0 4px;
            color: var(--green);
          }
          .slip-remarks {
            margin-top: 10px;
            border-top: 1px dashed #94a3b8;
            padding-top: 6px;
          }
        }
      `}</style>
    </>
  );
}
