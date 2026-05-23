import { get, ref, set } from "firebase/database";
import { DEFAULT_CLASS_CONFIG, getClassConfig } from "./classConfig";
import { fetchSchoolClasses } from "./schoolClassesClient";
import { CLASS_TEACHERS_PATH, getDb } from "./firebase";

/** Default staff IDs aligned with teacher login credentials. */
export const DEFAULT_STAFF_IDS = {
  classone: "TCH001",
  classtwo: "TCH002",
  classthree: "TCH003",
  classfour: "TCH004",
  classfive: "TCH005",
  classsix: "TCH006",
};

function getFirebaseErrorMessage(error) {
  const code = error?.code || "";
  if (code === "PERMISSION_DENIED" || code === "permission-denied") {
    return "Database permission denied. Allow classTeachers read/write in Realtime Database rules.";
  }
  return error?.message || "Failed to load class teacher settings.";
}

function emptyTeacherRecord(classSlug, classConfig = DEFAULT_CLASS_CONFIG) {
  const cfg = getClassConfig(classSlug, classConfig);
  return {
    classSlug,
    className: cfg.className,
    label: cfg.label,
    teacherName: "",
    staffId: DEFAULT_STAFF_IDS[classSlug] || "",
    updatedAt: null,
  };
}

/** @returns {Promise<Record<string, object>>} */
export async function fetchAllClassTeachers() {
  try {
    const classConfig = await fetchSchoolClasses();
    const slugs = Object.keys(classConfig);
    const db = getDb();
    const snapshot = await get(ref(db, CLASS_TEACHERS_PATH));
    const stored = snapshot.exists() ? snapshot.val() : {};

    const merged = {};
    for (const slug of slugs) {
      const saved = stored[slug];
      merged[slug] = {
        ...emptyTeacherRecord(slug, classConfig),
        ...(saved || {}),
        classSlug: slug,
        className: classConfig[slug].className,
        label: classConfig[slug].label,
      };
    }
    return merged;
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}

/** @param {string} classSlug */
export async function fetchClassTeacher(classSlug) {
  const all = await fetchAllClassTeachers();
  return all[classSlug] || emptyTeacherRecord(classSlug);
}

/**
 * @param {string} classSlug
 * @param {{ teacherName?: string; staffId?: string }} payload
 */
export async function saveClassTeacher(classSlug, payload) {
  const classConfig = await fetchSchoolClasses();
  if (!classConfig[classSlug]) {
    throw new Error("Invalid class.");
  }

  const teacherName = String(payload.teacherName ?? "").trim();
  if (!teacherName) {
    throw new Error("Teacher name is required.");
  }

  try {
    const db = getDb();
    const cfg = getClassConfig(classSlug, classConfig);
    const existing = await fetchClassTeacher(classSlug);
    const loginPassword = String(
      payload.loginPassword ?? existing?.loginPassword ?? "",
    ).trim();
    const record = {
      classSlug,
      className: cfg.className,
      label: cfg.label,
      teacherName,
      staffId: String(payload.staffId ?? DEFAULT_STAFF_IDS[classSlug] ?? "").trim(),
      ...(loginPassword ? { loginPassword } : {}),
      updatedAt: new Date().toISOString(),
    };
    await set(ref(db, `${CLASS_TEACHERS_PATH}/${classSlug}`), record);
    return record;
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}

/** @param {Record<string, { teacherName?: string; staffId?: string }>} settingsByClass */
export async function saveAllClassTeachers(settingsByClass) {
  const slugs = Object.keys(settingsByClass);
  for (const slug of slugs) {
    await saveClassTeacher(slug, settingsByClass[slug]);
  }
}

/** Display name for welcome banners. */
export function getTeacherDisplayName(record) {
  const name = record?.teacherName?.trim();
  return name || "Teacher";
}
