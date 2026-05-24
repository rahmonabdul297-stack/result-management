import { get, ref, set } from "firebase/database";
import { getDb, SCHOOL_SETTINGS_PATH } from "./firebase";

export const DEFAULT_SCHOOL_SETTINGS = {
  schoolName: "AYODELE NURSERY AND PRIMARY SCHOOL",
  schoolAddress:
    "6. Babatunde Awosanya Street, Jesu Walalaye Aiyegbami, Sagamu. Ogun State.",
  schoolMotto: "Knowledge, Character, Excellence.",
  schoolEmail: "",
  schoolWebsite: "",
};

function getFirebaseErrorMessage(error) {
  const code = error?.code || "";
  if (code === "PERMISSION_DENIED" || code === "permission-denied") {
    return "Database permission denied. Allow schoolSettings read/write in Realtime Database rules.";
  }
  return error?.message || "Failed to load school settings.";
}

/** @returns {Promise<typeof DEFAULT_SCHOOL_SETTINGS & { updatedAt: string | null }>} */
export async function fetchSchoolSettings() {
  try {
    const db = getDb();
    const snapshot = await get(ref(db, SCHOOL_SETTINGS_PATH));
    const stored = snapshot.exists() ? snapshot.val() : {};
    return {
      ...DEFAULT_SCHOOL_SETTINGS,
      schoolName: String(stored.schoolName ?? DEFAULT_SCHOOL_SETTINGS.schoolName).trim(),
      schoolAddress: String(
        stored.schoolAddress ?? DEFAULT_SCHOOL_SETTINGS.schoolAddress,
      ).trim(),
      schoolMotto: String(stored.schoolMotto ?? DEFAULT_SCHOOL_SETTINGS.schoolMotto).trim(),
      schoolEmail: String(stored.schoolEmail ?? DEFAULT_SCHOOL_SETTINGS.schoolEmail).trim(),
      schoolWebsite: String(
        stored.schoolWebsite ?? DEFAULT_SCHOOL_SETTINGS.schoolWebsite,
      ).trim(),
      updatedAt: stored.updatedAt ?? null,
    };
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}

/**
 * @param {{ schoolName?: string; schoolAddress?: string; schoolMotto?: string }} payload
 */
export async function saveSchoolSettings(payload) {
  const schoolName = String(payload.schoolName ?? "").trim();
  const schoolAddress = String(payload.schoolAddress ?? "").trim();
  const schoolMotto = String(payload.schoolMotto ?? "").trim();

  if (!schoolName) {
    throw new Error("School name is required.");
  }
  if (!schoolAddress) {
    throw new Error("School address is required.");
  }
  if (!schoolMotto) {
    throw new Error("School motto is required.");
  }

  try {
    const db = getDb();
    const record = {
      schoolName,
      schoolAddress,
      schoolMotto,
      schoolEmail: String(payload.schoolEmail ?? "").trim(),
      schoolWebsite: String(payload.schoolWebsite ?? "").trim(),
      updatedAt: new Date().toISOString(),
    };
    await set(ref(db, SCHOOL_SETTINGS_PATH), record);
    return record;
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}
