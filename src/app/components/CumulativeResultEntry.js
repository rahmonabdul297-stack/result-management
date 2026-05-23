"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ResultSlipA4 from "@/app/components/ResultSlipA4";
import ClassTeacherWelcome from "@/app/components/ClassTeacherWelcome";
import {
  TERM_LABELS,
  TERM_ORDER,
  buildCumulativeFromTerms,
  mapTermResultsByKey,
  mergeTraitMaps,
} from "@/lib/cumulativeResults";
import { fetchClassSubjects } from "@/lib/classSubjectsClient";
import { fetchClassStudents } from "@/lib/classStudentsClient";
import { fetchClassTeacher } from "@/lib/classTeachersClient";
import { getClassConfig } from "@/lib/classConfig";
import {
  fetchStudentTermResultsForCumulative,
  findCumulativeResult,
  saveCumulativeResult,
} from "@/lib/resultApiClient";
import {
  BEHAVIOUR_TRAITS,
  PSYCHOMOTOR_TRAITS,
} from "@/lib/resultSlipConstants";
import {
  DEFAULT_SCHOOL_SETTINGS,
  fetchSchoolSettings,
} from "@/lib/schoolSettingsClient";
import { getGrade, getRemark, TRAIT_LETTER_GRADES } from "@/lib/resultGrading";
import { toast } from "sonner";

const SESSION_OPTIONS = ["2024/2025", "2025/2026", "2026/2027", "2027/2028"];

const toNum = (v) => (v === "" ? 0 : Number(v) || 0);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function CumulativeResultEntry({ classSlug }) {
  const classConfig = getClassConfig(classSlug);
  const [schoolSettings, setSchoolSettings] = useState(DEFAULT_SCHOOL_SETTINGS);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [defaultTeacherName, setDefaultTeacherName] = useState("");

  const [academicSession, setAcademicSession] = useState("2025/2026");
  const [admissionNo, setAdmissionNo] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("Female");
  const [rows, setRows] = useState([]);
  const [termMeta, setTermMeta] = useState({});
  const [missingTerms, setMissingTerms] = useState(TERM_ORDER);
  const [termsFound, setTermsFound] = useState([]);
  const [behaviour, setBehaviour] = useState({});
  const [psych, setPsych] = useState({});
  const [houseRemark, setHouseRemark] = useState("");
  const [principalRemark, setPrincipalRemark] = useState("");
  const [existingCumulativeId, setExistingCumulativeId] = useState(null);
  const [passport, setPassport] = useState("");

  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchSchoolSettings().then(setSchoolSettings).catch(() => {});
    fetchClassStudents(classSlug)
      .then((r) => setRegisteredStudents(r?.students ?? []))
      .catch(() => {});
    fetchClassSubjects(classSlug)
      .then((r) => setClassSubjects(r?.subjects ?? []))
      .catch(() => {});
    fetchClassTeacher(classSlug)
      .then((r) => {
        const n = r?.teacherName?.trim() || "";
        setDefaultTeacherName(n);
      })
      .catch(() => {});
  }, [classSlug]);

  const subjectNames = useMemo(
    () => classSubjects.map((s) => s.name).filter(Boolean),
    [classSubjects],
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
    return {
      count: active.length,
      total: Math.round(total * 10) / 10,
      avg: Math.round(avg * 10) / 10,
      grade: getGrade(avg),
    };
  }, [computed]);

  const runCalculate = useCallback(async () => {
    const adm = admissionNo.trim();
    if (!adm) {
      toast.error("Enter admission number first.");
      return;
    }
    if (!academicSession) {
      toast.error("Select academic session.");
      return;
    }

    try {
      setCalculating(true);
      const [termList, existing] = await Promise.all([
        fetchStudentTermResultsForCumulative({
          admissionNo: adm,
          academicSession,
          classSlug,
        }),
        findCumulativeResult({ admissionNo: adm, academicSession, classSlug }),
      ]);

      if (!termList.length) {
        toast.error("No term results found for this student and session.");
        setRows([]);
        setTermsFound([]);
        return;
      }

      const byTerm = mapTermResultsByKey(termList);
      const built = buildCumulativeFromTerms(byTerm, subjectNames);

      if (!built.rows.length) {
        toast.error("Could not build cumulative rows from term data.");
        return;
      }

      const base = termList[0];
      setName(base.name || name);
      setGender(base.gender || gender);
      setPassport(base.passport || existing?.passport || "");
      setRows(built.rows);
      setTermMeta(built.termMeta);
      setMissingTerms(built.missingTerms);
      setTermsFound(built.termKeys);
      setBehaviour(mergeTraitMaps(byTerm, "behaviour", BEHAVIOUR_TRAITS));
      setPsych(mergeTraitMaps(byTerm, "psych", PSYCHOMOTOR_TRAITS));
      setHouseRemark(existing?.houseRemark || base.houseRemark || "");
      setPrincipalRemark(existing?.principalRemark || "");
      setExistingCumulativeId(existing?.id || null);

      if (built.missingTerms.length) {
        toast.warning(
          `Calculated from ${built.termKeys.length} term(s). Missing: ${built.missingTerms.map((t) => TERM_LABELS[t]).join(", ")}.`,
        );
      } else {
        toast.success("Cumulative scores calculated from all three terms.");
      }
    } catch (err) {
      toast.error(err?.message || "Calculation failed.");
    } finally {
      setCalculating(false);
    }
  }, [admissionNo, academicSession, classSlug, subjectNames, name, gender]);

  const updateRow = (id, key, value, max = 100) => {
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
  };

  const handleSubmit = async () => {
    if (!name.trim() || !admissionNo.trim()) {
      toast.error("Student name and admission number are required.");
      return;
    }
    if (!rows.some((r) => r.subject.trim())) {
      toast.error("Calculate or enter subject rows first.");
      return;
    }

    const payload = {
      schoolName: schoolSettings.schoolName,
      schoolAddress: schoolSettings.schoolAddress,
      schoolTagline: schoolSettings.schoolMotto,
      academicSession,
      term: "Overall",
      resultType: "cumulative",
      termsIncluded: termsFound,
      termResultIds: Object.fromEntries(
        Object.entries(termMeta).map(([t, m]) => [t, m.id]),
      ),
      name: name.trim(),
      admissionNo: admissionNo.trim(),
      gender,
      className: classConfig.className,
      classSlug,
      classSize: "",
      discipline: classConfig.className,
      position: "SATISFACTORY",
      teacherName: defaultTeacherName,
      rows: computed,
      summary,
      behaviour,
      psych,
      passport,
      houseRemark,
      principalRemark,
    };

    try {
      setSaving(true);
      const saved = await saveCumulativeResult(payload);
      setExistingCumulativeId(saved.id);
      toast.success(
        existingCumulativeId ? "Cumulative result updated." : "Cumulative result saved.",
      );
    } catch (err) {
      toast.error(err?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const slipData = {
    schoolName: schoolSettings.schoolName,
    schoolAddress: schoolSettings.schoolAddress,
    schoolTagline: schoolSettings.schoolMotto,
    academicSession,
    term: "Overall",
    name,
    admissionNo,
    gender,
    className: classConfig.className,
    discipline: classConfig.className,
    rows: computed,
    summary,
    behaviour,
    psych,
    passport,
    houseRemark,
    principalRemark,
  };

  if (showPreview) {
    return (
      <div className="result-view-page resultdetails-page page-content overflow-y-auto w-full">
        <div className="result-view-toolbar no-print">
          <button
            type="button"
            className="btn btn-outline btn-sm w-full sm:w-auto"
            onClick={() => setShowPreview(false)}
          >
            ← Back to entry
          </button>
          <button
            type="button"
            className="btn btn-gold btn-sm w-full sm:w-auto"
            onClick={() => window.print()}
          >
            Print slip
          </button>
        </div>
        <p className="result-view-mobile-hint no-print">
          Pinch or scroll to view the full slip. Use Print for a full A4 PDF.
        </p>
        <div className="result-slip-print-visible">
          <ResultSlipA4 data={slipData} school={schoolSettings} />
        </div>
      </div>
    );
  }

  return (
    <div className="resultdetails-page page-content overflow-y-auto w-full">
      <div className="mb-6">
        <ClassTeacherWelcome
          classSlug={classSlug}
          subtitle={`Build annual cumulative results from 1st, 2nd & 3rd term scores for ${classConfig.label}.`}
        />
      </div>

      <div className="card mb-4">
        <div className="card-title">Student &amp; session</div>
        <div className="form-row four">
          <div className="form-field">
            <label>Academic session</label>
            <select
              value={academicSession}
              onChange={(e) => setAcademicSession(e.target.value)}
            >
              {SESSION_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          {registeredStudents.length > 0 ? (
            <div className="form-field sm:col-span-3">
              <label>Select student</label>
              <select
                defaultValue=""
                onChange={(e) => {
                  const s = registeredStudents.find((x) => x.id === e.target.value);
                  if (!s) return;
                  setAdmissionNo(s.admissionNo);
                  setName(s.name);
                  setGender(s.gender || "Female");
                  e.target.value = "";
                }}
              >
                <option value="">— Pick registered student —</option>
                {registeredStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.admissionNo})
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="form-field">
            <label>Admission no.</label>
            <input
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value)}
              placeholder="e.g. BWIA/1082/21"
            />
          </div>
          <div className="form-field">
            <label>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <button
          type="button"
          className="btn btn-green"
          disabled={calculating}
          onClick={runCalculate}
        >
          {calculating ? "Calculating…" : "Calculate from 1st, 2nd & 3rd term"}
        </button>
        {existingCumulativeId ? (
          <p className="text-xs text-AppGray mt-2">
            An overall result already exists — saving will update it.
          </p>
        ) : null}
      </div>

      {termsFound.length > 0 ? (
        <div className="card mb-4">
          <div className="card-title">Terms used in calculation</div>
          <div className="flex flex-wrap gap-2">
            {TERM_ORDER.map((t) => {
              const found = termsFound.includes(t);
              const meta = termMeta[t];
              return (
                <div
                  key={t}
                  className={`rounded-lg border px-3 py-2 text-sm ${found ? "border-green-600 bg-green-50" : "border-gray-200 bg-gray-50 text-AppGray"}`}
                >
                  <strong>{TERM_LABELS[t]}</strong>
                  {found ? (
                    <span className="block text-xs">
                      Avg {meta?.avg != null ? Number(meta.avg).toFixed(1) : "—"} · Grade{" "}
                      {meta?.grade ?? "—"}
                    </span>
                  ) : (
                    <span className="block text-xs">Not found</span>
                  )}
                </div>
              );
            })}
          </div>
          {missingTerms.length > 0 ? (
            <p className="text-xs text-amber-700 mt-2">
              Missing terms are averaged from available terms only:{" "}
              {missingTerms.map((t) => TERM_LABELS[t]).join(", ")}.
            </p>
          ) : null}
        </div>
      ) : null}

      {rows.length > 0 ? (
        <>
          <div className="card mb-4">
            <div className="card-title">Cumulative subject scores (editable)</div>
            <p className="text-xs text-AppGray mb-3">
              Each score is the average of CA, mid-term CA, and exam across the terms found.
            </p>
            <div className="table-wrap">
              <table className="stbl">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>CA 20%</th>
                    <th>CA 20%</th>
                    <th>Exam 60%</th>
                    <th>Total</th>
                    <th>Grade</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {computed.map((r) => (
                    <tr key={r.id}>
                      <td>{r.subject}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={r.ca}
                          onChange={(e) => updateRow(r.id, "ca", e.target.value, 20)}
                          className="w-16"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={r.mid}
                          onChange={(e) => updateRow(r.id, "mid", e.target.value, 20)}
                          className="w-16"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={r.exam}
                          onChange={(e) => updateRow(r.id, "exam", e.target.value, 60)}
                          className="w-16"
                        />
                      </td>
                      <td>{r.total}</td>
                      <td>{r.grade}</td>
                      <td>{r.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm">
              Subjects: <strong>{summary.count}</strong> · Cumulative average:{" "}
              <strong>{summary.avg}</strong> · Grade: <strong>{summary.grade}</strong>
            </p>
          </div>

          <div className="card mb-4">
            <div className="card-title">Remarks</div>
            <div className="form-row two">
              <div className="form-field">
                <label>Class teacher&apos;s comment</label>
                <textarea
                  rows={2}
                  value={houseRemark}
                  onChange={(e) => setHouseRemark(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Principal remark</label>
                <textarea
                  rows={2}
                  value={principalRemark}
                  onChange={(e) => setPrincipalRemark(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="btn-row">
            <button type="button" className="btn btn-green" disabled={saving} onClick={handleSubmit}>
              {saving ? "Saving…" : existingCumulativeId ? "Update cumulative" : "Save cumulative"}
            </button>
            <button
              type="button"
              className="btn btn-gold"
              onClick={() => setShowPreview(true)}
            >
              Preview slip
            </button>
            {existingCumulativeId ? (
              <Link
                href={`/result/${existingCumulativeId}?from=teacher&class=${classSlug}`}
                className="btn btn-outline"
              >
                View PDF
              </Link>
            ) : null}
          </div>
        </>
      ) : null}

      <div className="admin-banner mt-6">
        <span>📊</span>
        <span>
          Enter the same <strong>admission number</strong> used on term slips. The system averages
          each subject across 1st, 2nd, and 3rd term before you save the annual result.
        </span>
      </div>
    </div>
  );
}
