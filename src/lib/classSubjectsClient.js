import { get, ref, set } from "firebase/database";
import { DEFAULT_CLASS_CONFIG, getClassConfig } from "./classConfig";
import { fetchSchoolClasses } from "./schoolClassesClient";
import { CLASS_SUBJECTS_PATH, getDb } from "./firebase";

function getFirebaseErrorMessage(error) {
  const code = error?.code || "";
  if (code === "PERMISSION_DENIED" || code === "permission-denied") {
    return "Database permission denied. Allow classSubjects read/write in Realtime Database rules.";
  }
  return error?.message || "Failed to load class subjects.";
}

function normalizeSubject(raw, index) {
  const name = String(raw?.name ?? raw ?? "").trim();
  const id =
    String(raw?.id ?? `subject-${index + 1}`).trim() || `subject-${index + 1}`;
  return { id, name };
}

function emptyClassRecord(classSlug, classConfig = DEFAULT_CLASS_CONFIG) {
  const cfg = getClassConfig(classSlug, classConfig);
  return {
    classSlug,
    className: cfg.className,
    label: cfg.label,
    subjects: [],
    updatedAt: null,
  };
}

function validateSubjects(subjects) {
  const list = subjects.map(normalizeSubject);
  const seen = new Set();

  for (const subject of list) {
    if (!subject.name) {
      throw new Error("Every subject must have a name.");
    }
    const key = subject.name.toLowerCase();
    if (seen.has(key)) {
      throw new Error(`Duplicate subject: ${subject.name}`);
    }
    seen.add(key);
  }

  return list;
}

/** @returns {Promise<Record<string, { subjects: { id: string; name: string }[] }>>} */
export async function fetchAllClassSubjects() {
  try {
    const classConfig = await fetchSchoolClasses();
    const slugs = Object.keys(classConfig);
    const db = getDb();
    const snapshot = await get(ref(db, CLASS_SUBJECTS_PATH));
    const stored = snapshot.exists() ? snapshot.val() : {};

    const merged = {};
    for (const slug of slugs) {
      const saved = stored[slug];
      const subjects = Array.isArray(saved?.subjects)
        ? saved.subjects.map(normalizeSubject)
        : [];
      merged[slug] = {
        ...emptyClassRecord(slug, classConfig),
        ...(saved || {}),
        classSlug: slug,
        className: classConfig[slug].className,
        label: classConfig[slug].label,
        subjects,
      };
    }
    return merged;
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}

/** @param {string} classSlug */
export async function fetchClassSubjects(classSlug) {
  const all = await fetchAllClassSubjects();
  return all[classSlug] || emptyClassRecord(classSlug);
}

/** @param {string} classSlug @param {object[]} subjects */
export async function saveClassSubjects(classSlug, subjects) {
  const classConfig = await fetchSchoolClasses();
  if (!classConfig[classSlug]) {
    throw new Error("Invalid class.");
  }

  const validated = validateSubjects(subjects);

  try {
    const db = getDb();
    const cfg = getClassConfig(classSlug, classConfig);
    const record = {
      classSlug,
      className: cfg.className,
      label: cfg.label,
      subjects: validated,
      updatedAt: new Date().toISOString(),
    };
    await set(ref(db, `${CLASS_SUBJECTS_PATH}/${classSlug}`), record);
    return record;
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}

/** @param {Record<string, { subjects?: object[] }>} subjectsByClass */
export async function saveAllClassSubjects(subjectsByClass) {
  for (const slug of Object.keys(subjectsByClass)) {
    await saveClassSubjects(slug, subjectsByClass[slug]?.subjects ?? []);
  }
}

export function createSubjectRow() {
  return {
    id: `subject-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
  };
}

/** Build result entry rows from admin-configured subjects. */
export function subjectsToResultRows(subjects = [], makeRow) {
  const list = subjects.filter((s) => String(s?.name ?? "").trim());
  if (!list.length) return [makeRow("row-1")];
  return list.map((s, index) => ({
    ...makeRow(s.id || `row-${index + 1}`),
    subject: s.name,
  }));
}
