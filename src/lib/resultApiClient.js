import { get, push, ref, remove, set } from "firebase/database";
import { isCumulativeResult, isTermResult } from "./cumulativeResults";
import { getDb, RESULTS_PATH } from "./firebase";

const MAX_PASSPORT_CHARS = 900_000;

function getFirebaseErrorMessage(error) {
  const code = error?.code || "";
  if (code === "PERMISSION_DENIED" || code === "permission-denied") {
    return "Database permission denied. Set Realtime Database rules to allow studentResults read/write.";
  }
  if (code === "UNAVAILABLE" || code === "unavailable") {
    return "Database is unavailable. Check your internet connection and Firebase project.";
  }
  if (String(error?.message || "").includes("not found")) {
    return "Realtime Database not found. Enable Realtime Database in Firebase Console for this project.";
  }
  return error?.message || "Firebase operation failed.";
}

function stripUndefined(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(stripUndefined);

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    cleaned[key] = stripUndefined(value);
  }
  return cleaned;
}

function prepareRecord(payload) {
  if (payload.passport && String(payload.passport).length > MAX_PASSPORT_CHARS) {
    throw new Error("Passport image is too large. Please use a smaller photo (under 700KB).");
  }

  const now = new Date().toISOString();
  return stripUndefined({
    ...payload,
    submittedAt: now,
    createdAt: now,
  });
}

function sortByNewest(results) {
  return [...results].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}

export async function submitStudentResult(payload) {
  try {
    const db = getDb();
    const record = prepareRecord(payload);
    const listRef = ref(db, RESULTS_PATH);
    const newRef = push(listRef);
    await set(newRef, record);
    return { id: newRef.key, ...record };
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}

export async function fetchStudentResults(filters = {}) {
  try {
    const db = getDb();
    const snapshot = await get(ref(db, RESULTS_PATH));

    if (!snapshot.exists()) return [];

    const raw = snapshot.val();
    let results = Object.entries(raw).map(([id, data]) => ({
      id,
      ...data,
    }));

    if (filters.classSlug) {
      results = results.filter((item) => item.classSlug === filters.classSlug);
    }
    if (filters.className) {
      results = results.filter((item) => item.className === filters.className);
    }
    if (filters.term) {
      results = results.filter((item) => item.term === filters.term);
    }
    if (filters.academicSession) {
      results = results.filter((item) => item.academicSession === filters.academicSession);
    }
    if (filters.resultType === "cumulative") {
      results = results.filter((item) => isCumulativeResult(item));
    } else if (filters.resultType === "term") {
      results = results.filter((item) => isTermResult(item));
    } else if (filters.excludeCumulative !== false) {
      results = results.filter((item) => isTermResult(item));
    }

    return sortByNewest(results);
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}

/** Normalize term from UI labels to stored values. */
export function normalizeTermValue(term) {
  const t = String(term ?? "").trim().toLowerCase();
  if (t === "1" || t === "first" || t === "first term" || t === "1st") return "1st";
  if (t === "2" || t === "second" || t === "second term" || t === "2nd") return "2nd";
  if (t === "3" || t === "third" || t === "third term" || t === "3rd") return "3rd";
  return String(term ?? "").trim();
}

/**
 * Find a single result for the public checker (admission no + session + term).
 */
export async function findStudentResult({ admissionNo, academicSession, term }) {
  const studentId = String(admissionNo ?? "").trim();
  if (!studentId) {
    throw new Error("Student ID is required.");
  }
  if (!academicSession) {
    throw new Error("Please select the academic year.");
  }
  if (!term) {
    throw new Error("Please select a term.");
  }

  const normalizedTerm = normalizeTermValue(term);
  const termLower = String(term ?? "").trim().toLowerCase();
  const isOverall =
    termLower === "overall" ||
    termLower === "cumulative" ||
    termLower === "cumulative / annual" ||
    normalizedTerm.toLowerCase() === "overall";

  const results = await fetchStudentResults({
    academicSession,
    ...(isOverall
      ? { resultType: "cumulative", excludeCumulative: false }
      : { term: normalizedTerm, excludeCumulative: true }),
  });

  const match = results.find(
    (item) =>
      String(item.admissionNo ?? "").trim().toLowerCase() === studentId.toLowerCase(),
  );

  if (!match) {
    throw new Error(
      "No result found for this Student ID, year, and term. Check your details and try again.",
    );
  }

  return match;
}

export async function fetchStudentResultById(id) {
  if (!id?.trim?.()) {
    throw new Error("Result id is required.");
  }

  try {
    const db = getDb();
    const snapshot = await get(ref(db, `${RESULTS_PATH}/${id}`));
    if (!snapshot.exists()) {
      throw new Error("Result not found.");
    }
    return { id, ...snapshot.val() };
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}

export async function updateStudentResult(id, payload) {
  if (!id?.trim?.()) {
    throw new Error("Result id is required.");
  }

  try {
    const db = getDb();
    const snapshot = await get(ref(db, `${RESULTS_PATH}/${id}`));
    const existing = snapshot.exists() ? snapshot.val() : {};
    const record = prepareRecord({
      ...existing,
      ...payload,
      createdAt: existing.createdAt || new Date().toISOString(),
    });
    await set(ref(db, `${RESULTS_PATH}/${id}`), record);
    return { id, ...record };
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}

/** Find existing cumulative slip for student + session + class. */
export async function findCumulativeResult({ admissionNo, academicSession, classSlug }) {
  const studentId = String(admissionNo ?? "").trim().toLowerCase();
  const results = await fetchStudentResults({
    academicSession,
    classSlug,
    resultType: "cumulative",
    excludeCumulative: false,
  });
  return (
    results.find(
      (item) =>
        String(item.admissionNo ?? "").trim().toLowerCase() === studentId &&
        item.classSlug === classSlug,
    ) || null
  );
}

export async function saveCumulativeResult(payload) {
  const existing = await findCumulativeResult({
    admissionNo: payload.admissionNo,
    academicSession: payload.academicSession,
    classSlug: payload.classSlug,
  });

  const record = {
    ...payload,
    resultType: "cumulative",
    term: "Overall",
  };

  if (existing?.id) {
    return updateStudentResult(existing.id, record);
  }
  return submitStudentResult(record);
}

export async function fetchStudentTermResultsForCumulative({
  admissionNo,
  academicSession,
  classSlug,
}) {
  const studentId = String(admissionNo ?? "").trim().toLowerCase();
  const results = await fetchStudentResults({
    academicSession,
    classSlug,
    resultType: "term",
    excludeCumulative: false,
  });
  return results.filter(
    (item) => String(item.admissionNo ?? "").trim().toLowerCase() === studentId,
  );
}

export async function deleteStudentResult(id) {
  if (!id?.trim?.()) {
    throw new Error("Result id is required.");
  }

  try {
    const db = getDb();
    await remove(ref(db, `${RESULTS_PATH}/${id}`));
    return { id };
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}
