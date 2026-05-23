"use client";

import Logo from "@/app/logo";
import {
  BEHAVIOUR_TRAITS,
  PSYCHOMOTOR_TRAITS,
} from "@/lib/resultSlipConstants";
import {
  GRADE_KEY,
  TRAIT_GRADE_KEY,
  formatSessionBanner,
} from "@/lib/resultGrading";

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Official-style result sheet layout (BrightWay format).
 * @param {{ data: object; school?: object; className?: string }} props
 */
export default function ResultSlipTemplate({
  data,
  school = {},
  className = "",
  omitSchoolHeader = false,
}) {
  const schoolName = data.schoolName || school.schoolName || "";
  const schoolAddress = data.schoolAddress || school.schoolAddress || "";
  const schoolMotto = data.schoolTagline || data.schoolMotto || school.schoolMotto || "";
  const schoolEmail = school.schoolEmail || data.schoolEmail || "";
  const schoolWebsite = school.schoolWebsite || data.schoolWebsite || "";

  const rows = (Array.isArray(data.rows) ? data.rows : []).filter((r) =>
    String(r?.subject ?? "").trim(),
  );
  const summary = data.summary || {};
  const behaviour = data.behaviour || {};
  const psych = data.psych || {};

  const traitRowCount = Math.max(BEHAVIOUR_TRAITS.length, PSYCHOMOTOR_TRAITS.length);
  const gradeLabel = data.discipline || data.className || "—";
  const sessionBanner = formatSessionBanner(data.term, data.academicSession);

  return (
    <div className={`bw-slip ${omitSchoolHeader ? "bw-slip--body-only" : ""} ${className}`.trim()}>
      {!omitSchoolHeader ? (
        <header className="bw-slip-header">
          <div className="bw-slip-logo">
            <Logo />
          </div>
          <div className="bw-slip-school">
            <h1 className="bw-slip-school-name">{schoolName}</h1>
            <p className="bw-slip-address">{schoolAddress}</p>
            <p className="bw-slip-motto">
              <em>{schoolMotto}</em>
            </p>
          </div>
          <div className="bw-slip-contact">
            {schoolEmail ? <p>Email: {schoolEmail}</p> : null}
            {schoolWebsite ? <p>Website: {schoolWebsite}</p> : null}
          </div>
        </header>
      ) : null}

      <div className="bw-slip-title-band">RESULT SHEET</div>

      <div className="bw-slip-student-grid">
        <div className="bw-slip-student-col">
          <p>
            <span className="bw-label">Name:</span>{" "}
            <strong>{data.name || "—"}</strong>
          </p>
          <p>
            <span className="bw-label">Age:</span> {data.age || "—"}
          </p>
          <p>
            <span className="bw-label">House:</span> {data.house || "—"}
          </p>
          <p>
            <span className="bw-label">No in Class:</span> {data.classSize || "—"}
          </p>
          <p>
            <span className="bw-label">Next Term Begins:</span>{" "}
            {formatDate(data.nextBegin) || data.nextBegin || "—"}
          </p>
        </div>
        <div className="bw-slip-student-center">
          <p>
            <span className="bw-label">Position:</span>{" "}
            <strong>{data.position || "—"}</strong>
          </p>
        </div>
        <div className="bw-slip-student-col bw-slip-student-col-right">
          <p>
            <span className="bw-label">Grade:</span> <strong>{gradeLabel}</strong>
          </p>
          <p>
            <span className="bw-label">Gender:</span> {data.gender || "—"}
          </p>
          <p>
            <span className="bw-label">Admission No:</span> {data.admissionNo || "—"}
          </p>
          <p>
            <span className="bw-label">Next Term Ends:</span>{" "}
            {formatDate(data.nextEnd) || data.nextEnd || "—"}
          </p>
        </div>
      </div>

      <p className="bw-slip-session">{sessionBanner}</p>

      <table className="bw-slip-scores">
        <thead>
          <tr>
            <th className="bw-col-subject">Subject</th>
            <th>CA 20%</th>
            <th>CA 20%</th>
            <th>Exam 60%</th>
            <th>Total score 100%</th>
            <th>Class Average</th>
            <th>Grade</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((r) => (
              <tr key={r.id || r.subject}>
                <td className="bw-col-subject">{r.subject}</td>
                <td>{r.ca ?? ""}</td>
                <td>{r.mid ?? ""}</td>
                <td>{r.exam ?? ""}</td>
                <td>{r.total ?? ""}</td>
                <td>{r.classAvg ?? ""}</td>
                <td>{r.grade ?? ""}</td>
                <td>{r.remark ?? ""}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="bw-empty">
                No subjects entered
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="bw-slip-score-summary">
        <div>
          <span>Total Score</span>
          <strong>{summary.total ?? "—"}</strong>
        </div>
        <div>
          <span>No. of Subjects</span>
          <strong>{summary.count ?? rows.length}</strong>
        </div>
        <div>
          <span>Average Score</span>
          <strong>
            {summary.avg != null ? Number(summary.avg).toFixed(1) : "—"}
          </strong>
        </div>
        <div>
          <span>Average Grade</span>
          <strong>{summary.grade ?? "—"}</strong>
        </div>
      </div>

      <div className="bw-slip-grade-key">
        <strong>Keys to Grades:</strong>
        {GRADE_KEY.map((g) => (
          <span key={g.grade}>
            {g.grade}: {g.range} ({g.label})
          </span>
        ))}
      </div>

      <table className="bw-slip-traits">
        <thead>
          <tr>
            <th>Behavioural Traits/Personality</th>
            <th />
            <th>Psychomotor</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: traitRowCount }).map((_, i) => {
            const bTrait = BEHAVIOUR_TRAITS[i];
            const pTrait = PSYCHOMOTOR_TRAITS[i];
            return (
              <tr key={`trait-${i}`}>
                <td>{bTrait || ""}</td>
                <td>{bTrait ? behaviour[bTrait] || "—" : ""}</td>
                <td>{pTrait || ""}</td>
                <td>{pTrait ? psych[pTrait] || "—" : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="bw-slip-trait-key">
        <strong>Key:</strong>
        {TRAIT_GRADE_KEY.map((t) => (
          <span key={t.grade}>
            {t.grade} – {t.label}
          </span>
        ))}
      </div>

      <table className="bw-slip-physical">
        <thead>
          <tr>
            <th colSpan={2}>WEIGHT(KG)/HEIGHT(M)</th>
          </tr>
          <tr>
            <th>BEGINNING OF TERM</th>
            <th>END OF TERM</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {data.weightBegin || "—"}/{data.heightBegin || "—"}
            </td>
            <td>
              {data.weightEnd || "—"}/{data.heightEnd || "—"}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="bw-slip-comment">
        <strong>Class Teacher&apos;s Comment:</strong>
        <p>{data.houseRemark || data.classTeacherComment || "—"}</p>
      </div>

      <div className="bw-slip-signatures">
        <div>
          <strong>Headteacher&apos;s Signature</strong>
          <div className="bw-sig-line" />
          <span className="bw-sig-date">
            Date: {formatDate(data.dateSigned) || data.dateSigned || "—"}
          </span>
        </div>
        <div>
          <strong>Parent&apos;s/Guardian&apos;s Signature</strong>
          <div className="bw-sig-line" />
          <span className="bw-sig-date">Date: —</span>
        </div>
      </div>

      {data.principalRemark ? (
        <div className="bw-slip-principal">
          <strong>Principal&apos;s Remark:</strong> {data.principalRemark}
        </div>
      ) : null}

      <p className="bw-slip-footer">Any alteration to this result renders it invalid!</p>
    </div>
  );
}
