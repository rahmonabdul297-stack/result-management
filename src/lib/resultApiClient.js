import { get, push, ref, remove, set } from "firebase/database";
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

    return sortByNewest(results);
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
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
