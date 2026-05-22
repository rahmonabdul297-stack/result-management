import { getAdminDb, RESULTS_COLLECTION } from "./firebaseAdmin";

export async function saveStudentResult(payload) {
  const db = getAdminDb();
  const doc = {
    ...payload,
    submittedAt: new Date().toISOString(),
    createdAt: new Date(),
  };

  const ref = await db.collection(RESULTS_COLLECTION).add(doc);
  return { id: ref.id, ...doc };
}

export async function getStudentResults(filters = {}) {
  const db = getAdminDb();
  let query = db.collection(RESULTS_COLLECTION);

  if (filters.classSlug) {
    query = query.where("classSlug", "==", filters.classSlug);
  } else if (filters.className) {
    query = query.where("className", "==", filters.className);
  }

  const snapshot = await query.orderBy("createdAt", "desc").get();

  let results = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() ?? doc.data().createdAt,
  }));

  if (filters.term) {
    results = results.filter((item) => item.term === filters.term);
  }
  if (filters.academicSession) {
    results = results.filter((item) => item.academicSession === filters.academicSession);
  }

  return results;
}
