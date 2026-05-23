import { getGrade, getRemark } from "./resultGrading";
import { normalizeTermValue } from "./resultApiClient";

export const TERM_ORDER = ["1st", "2nd", "3rd"];

export const TERM_LABELS = {
  "1st": "First Term",
  "2nd": "Second Term",
  "3rd": "Third Term",
};

export function isCumulativeResult(record) {
  return (
    record?.resultType === "cumulative" ||
    String(record?.term ?? "").toLowerCase() === "overall"
  );
}

export function isTermResult(record) {
  return !isCumulativeResult(record);
}

function normSubject(name) {
  return String(name ?? "").trim().toLowerCase();
}

function toNum(v) {
  return v === "" || v == null ? null : Number(v);
}

function avg(nums) {
  const valid = nums.filter((n) => n != null && !Number.isNaN(n));
  if (!valid.length) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

/** Pick latest term result per term key for one student. */
export function mapTermResultsByKey(termResults = []) {
  const byTerm = {};
  for (const term of TERM_ORDER) {
    const matches = termResults
      .filter((r) => isTermResult(r) && normalizeTermValue(r.term) === term)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (matches.length) byTerm[term] = matches[0];
  }
  return byTerm;
}

/**
 * Build cumulative subject rows by averaging 1st, 2nd & 3rd term scores per subject.
 */
export function buildCumulativeFromTerms(termResultsByKey, subjectOrder = []) {
  const termKeys = TERM_ORDER.filter((t) => termResultsByKey[t]);
  if (!termKeys.length) {
    return { rows: [], termKeys: [], termMeta: {}, missingTerms: TERM_ORDER };
  }

  const subjectSet = new Map();
  for (const term of termKeys) {
    const rows = termResultsByKey[term]?.rows || [];
    for (const row of rows) {
      const name = String(row?.subject ?? "").trim();
      if (!name) continue;
      const key = normSubject(name);
      if (!subjectSet.has(key)) {
        subjectSet.set(key, name);
      }
    }
  }

  const orderedNames = [];
  for (const name of subjectOrder) {
    const key = normSubject(name);
    if (subjectSet.has(key)) {
      orderedNames.push(subjectSet.get(key));
      subjectSet.delete(key);
    }
  }
  for (const name of subjectSet.values()) {
    orderedNames.push(name);
  }

  const termMeta = {};
  for (const term of termKeys) {
    const r = termResultsByKey[term];
    termMeta[term] = {
      id: r.id,
      avg: r.summary?.avg,
      grade: r.summary?.grade,
    };
  }

  const rows = orderedNames.map((subject, index) => {
    const key = normSubject(subject);
    const caVals = [];
    const midVals = [];
    const examVals = [];
    const totalVals = [];
    const classAvgVals = [];

    for (const term of termKeys) {
      const row = (termResultsByKey[term]?.rows || []).find(
        (r) => normSubject(r.subject) === key,
      );
      if (!row) continue;
      const ca = toNum(row.ca);
      const mid = toNum(row.mid);
      const exam = toNum(row.exam);
      const total = toNum(row.total);
      if (ca != null) caVals.push(ca);
      if (mid != null) midVals.push(mid);
      if (exam != null) examVals.push(exam);
      if (total != null) totalVals.push(total);
      else if (ca != null && mid != null && exam != null) {
        totalVals.push(ca + mid + exam);
      }
      const cAvg = toNum(row.classAvg);
      if (cAvg != null) classAvgVals.push(cAvg);
    }

    const caAvg = round1(avg(caVals));
    const midAvg = round1(avg(midVals));
    const examAvg = round1(avg(examVals));
    const totalFromParts = round1(caAvg + midAvg + examAvg);
    const total =
      totalVals.length > 0 ? round1(avg(totalVals)) : totalFromParts;

    return {
      id: `cum-row-${index + 1}`,
      subject,
      ca: caVals.length ? String(caAvg) : "",
      mid: midVals.length ? String(midAvg) : "",
      exam: examVals.length ? String(examAvg) : "",
      total,
      classAvg: classAvgVals.length ? String(round1(avg(classAvgVals))) : "",
      grade: getGrade(total),
      remark: getRemark(total),
      termBreakdown: Object.fromEntries(
        termKeys.map((term) => {
          const row = (termResultsByKey[term]?.rows || []).find(
            (r) => normSubject(r.subject) === key,
          );
          return [term, row?.total ?? "—"];
        }),
      ),
    };
  });

  const summary = computeRowsSummary(rows);
  const missingTerms = TERM_ORDER.filter((t) => !termResultsByKey[t]);

  return {
    rows,
    summary,
    termKeys,
    termMeta,
    missingTerms,
  };
}

export function computeRowsSummary(rows = []) {
  const active = rows.filter((r) => String(r.subject ?? "").trim());
  const total = active.reduce((s, r) => s + (Number(r.total) || 0), 0);
  const avgScore = active.length ? total / active.length : 0;
  return {
    count: active.length,
    total: round1(total),
    avg: round1(avgScore),
    grade: getGrade(avgScore),
  };
}

/** Merge psych/behaviour from latest available term. */
export function mergeTraitMaps(termResultsByKey, field, traitKeys) {
  const merged = {};
  const latestTerm = [...TERM_ORDER].reverse().find((t) => termResultsByKey[t]);
  const source = latestTerm ? termResultsByKey[latestTerm]?.[field] || {} : {};
  for (const trait of traitKeys) {
    merged[trait] = source[trait] || "B";
  }
  return merged;
}

export function formatCumulativeSessionBanner(session) {
  return `CUMULATIVE / ANNUAL RESULT, ${session || "2025/2026"} ACADEMIC SESSION`;
}
