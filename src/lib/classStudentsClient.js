import { get, ref, set } from "firebase/database";
import { DEFAULT_CLASS_CONFIG, getClassConfig } from "./classConfig";
import { fetchSchoolClasses } from "./schoolClassesClient";
import { CLASS_STUDENTS_PATH, getDb } from "./firebase";

function getFirebaseErrorMessage(error) {
  const code = error?.code || "";
  if (code === "PERMISSION_DENIED" || code === "permission-denied") {
    return "Database permission denied. Allow classStudents read/write in Realtime Database rules.";
  }
  return error?.message || "Failed to load class students.";
}

function normalizeStudent(raw, index) {
  const name = String(raw?.name ?? "").trim();
  const admissionNo = String(raw?.admissionNo ?? "").trim();
  const gender = raw?.gender === "Male" ? "Male" : "Female";
  const id = String(raw?.id ?? `student-${index + 1}`).trim() || `student-${index + 1}`;
  return { id, name, admissionNo, gender };
}

function emptyClassRecord(classSlug, classConfig = DEFAULT_CLASS_CONFIG) {
  const cfg = getClassConfig(classSlug, classConfig);
  return {
    classSlug,
    className: cfg.className,
    label: cfg.label,
    students: [],
    updatedAt: null,
  };
}

function validateStudents(students) {
  const list = students.map(normalizeStudent);
  const seen = new Set();

  for (const student of list) {
    if (!student.name) {
      throw new Error("Every student must have a full name.");
    }
    if (!student.admissionNo) {
      throw new Error("Every student must have an admission number.");
    }
    const key = student.admissionNo.toLowerCase();
    if (seen.has(key)) {
      throw new Error(`Duplicate admission number: ${student.admissionNo}`);
    }
    seen.add(key);
  }

  return list;
}

/** @returns {Promise<Record<string, { students: object[]; label: string; className: string }>>} */
export async function fetchAllClassStudents() {
  try {
    const classConfig = await fetchSchoolClasses();
    const slugs = Object.keys(classConfig);
    const db = getDb();
    const snapshot = await get(ref(db, CLASS_STUDENTS_PATH));
    const stored = snapshot.exists() ? snapshot.val() : {};

    const merged = {};
    for (const slug of slugs) {
      const saved = stored[slug];
      const students = Array.isArray(saved?.students)
        ? saved.students.map(normalizeStudent)
        : [];
      merged[slug] = {
        ...emptyClassRecord(slug, classConfig),
        ...(saved || {}),
        classSlug: slug,
        className: classConfig[slug].className,
        label: classConfig[slug].label,
        students,
      };
    }
    return merged;
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}

/** @param {string} classSlug */
export async function fetchClassStudents(classSlug) {
  const all = await fetchAllClassStudents();
  return all[classSlug] || emptyClassRecord(classSlug);
}

/** @param {string} classSlug @param {object[]} students */
export async function saveClassStudents(classSlug, students) {
  const classConfig = await fetchSchoolClasses();
  if (!classConfig[classSlug]) {
    throw new Error("Invalid class.");
  }

  const validated = validateStudents(students);

  try {
    const db = getDb();
    const cfg = getClassConfig(classSlug, classConfig);
    const record = {
      classSlug,
      className: cfg.className,
      label: cfg.label,
      students: validated,
      updatedAt: new Date().toISOString(),
    };
    await set(ref(db, `${CLASS_STUDENTS_PATH}/${classSlug}`), record);
    return record;
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}

/** @param {Record<string, { students?: object[] }>} studentsByClass */
export async function saveAllClassStudents(studentsByClass) {
  for (const slug of Object.keys(studentsByClass)) {
    await saveClassStudents(slug, studentsByClass[slug]?.students ?? []);
  }
}

export function createStudentRow() {
  return {
    id: `student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    admissionNo: "",
    gender: "Female",
  };
}
