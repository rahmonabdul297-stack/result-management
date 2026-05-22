import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function getFirebaseApp() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error(
      "Firebase is not configured. Check NEXT_PUBLIC_FIREBASE_* values in .env.local"
    );
  }
  if (!firebaseConfig.databaseURL) {
    throw new Error(
      "Missing NEXT_PUBLIC_FIREBASE_DATABASE_URL in .env.local (Realtime Database URL)."
    );
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

let rtdbInstance = null;

export function getDb() {
  if (!rtdbInstance) {
    rtdbInstance = getDatabase(getFirebaseApp());
  }
  return rtdbInstance;
}

export const RESULTS_PATH = "studentResults";
export const CLASS_TEACHERS_PATH = "classTeachers";
