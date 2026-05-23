import { get, ref, set } from "firebase/database";
import { DEFAULT_CLASS_CONFIG } from "./classConfig";
import { getDb, SCHOOL_CLASSES_PATH } from "./firebase";

function getFirebaseErrorMessage(error) {
  const code = error?.code || "";
  if (code === "PERMISSION_DENIED" || code === "permission-denied") {
    return "Database permission denied. Allow schoolClasses read/write in Realtime Database rules.";
  }
  return error?.message || "Failed to load school classes.";
}

function slugifyLabel(label) {
  const base = String(label)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  return base || "class";
}

function uniqueSlug(label, existing) {
  let slug = slugifyLabel(label);
  if (!existing[slug]) return slug;
  let n = 2;
  while (existing[`${slug}${n}`]) n += 1;
  return `${slug}${n}`;
}

/** @returns {Promise<Record<string, { label: string; className: string; order?: number }>>} */
export async function fetchSchoolClasses() {
  try {
    const db = getDb();
    const snapshot = await get(ref(db, SCHOOL_CLASSES_PATH));
    const stored = snapshot.exists() ? snapshot.val() : {};

    const merged = { ...DEFAULT_CLASS_CONFIG };
    for (const [slug, data] of Object.entries(stored)) {
      if (!data || typeof data !== "object") continue;
      const label = String(data.label ?? data.className ?? slug).trim();
      if (!label) continue;
      merged[slug] = {
        label,
        className: String(data.className ?? label).trim() || label,
        order: typeof data.order === "number" ? data.order : 100 + Object.keys(merged).length,
      };
    }

    return sortClassConfig(merged);
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}

export function sortClassConfig(config) {
  const entries = Object.entries(config).sort(([, a], [, b]) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return (a.label || "").localeCompare(b.label || "");
  });
  return Object.fromEntries(entries);
}

export function getClassSlugsFromConfig(config) {
  return Object.keys(config);
}

/**
 * @param {{ label: string; className?: string }} payload
 * @returns {Promise<{ slug: string; label: string; className: string }>}
 */
export async function addSchoolClass(payload) {
  const label = String(payload.label ?? "").trim();
  const className = String(payload.className ?? label).trim() || label;

  if (!label) {
    throw new Error("Class name is required.");
  }

  const existing = await fetchSchoolClasses();
  const slug = uniqueSlug(label, existing);

  if (existing[slug] && DEFAULT_CLASS_CONFIG[slug]) {
    throw new Error("This class already exists.");
  }

  const record = {
    label,
    className,
    order: 100 + Object.keys(existing).length,
    createdAt: new Date().toISOString(),
  };

  try {
    const db = getDb();
    await set(ref(db, `${SCHOOL_CLASSES_PATH}/${slug}`), record);
    return { slug, ...record };
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}

/** @param {string} slug */
export async function removeSchoolClass(slug) {
  if (DEFAULT_CLASS_CONFIG[slug]) {
    throw new Error("Built-in classes cannot be removed.");
  }

  try {
    const db = getDb();
    await set(ref(db, `${SCHOOL_CLASSES_PATH}/${slug}`), null);
    return { slug };
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}
