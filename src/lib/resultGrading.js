/** BrightWay-style grading scale (matches official result sheet). */

export const GRADE_KEY = [
  { grade: "A*", range: "90 – 100", label: "Excellent" },
  { grade: "A", range: "80 – 89", label: "Distinction" },
  { grade: "B+", range: "75 – 79", label: "V. Good" },
  { grade: "B", range: "70 – 74", label: "Good" },
  { grade: "C", range: "60 – 69", label: "Credit" },
  { grade: "D", range: "50 – 59", label: "Pass" },
  { grade: "E", range: "40 – 49", label: "Weak Pass" },
  { grade: "F", range: "0 – 39", label: "Fail" },
];

export const TRAIT_GRADE_KEY = [
  { grade: "A", label: "Excellent show of traits" },
  { grade: "B", label: "High level exhibition" },
  { grade: "C", label: "Acceptable level" },
  { grade: "D", label: "Minimal level" },
  { grade: "E", label: "No trait shown" },
];

export const TRAIT_LETTER_GRADES = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "E"];

export function getGrade(score) {
  const s = Number(score) || 0;
  if (s >= 90) return "A*";
  if (s >= 80) return "A";
  if (s >= 75) return "B+";
  if (s >= 70) return "B";
  if (s >= 60) return "C";
  if (s >= 50) return "D";
  if (s >= 40) return "E";
  return "F";
}

export function getRemark(score) {
  const s = Number(score) || 0;
  if (s >= 90) return "Excellent";
  if (s >= 80) return "Distinction";
  if (s >= 75) return "V. Good";
  if (s >= 70) return "Good";
  if (s >= 60) return "Credit";
  if (s >= 50) return "Pass";
  if (s >= 40) return "Weak Pass";
  return "Fail";
}

export function formatTermLabel(term) {
  const map = {
    "1st": "FIRST",
    "2nd": "SECOND",
    "3rd": "THIRD",
    first: "FIRST",
    second: "SECOND",
    third: "THIRD",
  };
  const key = String(term ?? "").trim().toLowerCase();
  return map[key] || String(term || "FIRST").toUpperCase();
}

export function formatSessionBanner(term, session) {
  const t = String(term ?? "").trim().toLowerCase();
  if (t === "overall" || t === "cumulative") {
    return `CUMULATIVE / ANNUAL RESULT, ${session || "2025/2026"} ACADEMIC SESSION`;
  }
  const termLabel = formatTermLabel(term);
  const sess = session || "2025/2026";
  return `${termLabel} TERM, ${sess} ACADEMIC SESSION`;
}
