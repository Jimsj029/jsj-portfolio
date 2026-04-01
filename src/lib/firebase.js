import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const isMissingOrPlaceholder = (value) => {
  if (!value) return true;
  const normalized = String(value).trim().toLowerCase();
  return normalized.startsWith("your_") || normalized.includes("your_");
};

const missingKeys = requiredKeys.filter((key) =>
  isMissingOrPlaceholder(import.meta.env[key])
);
if (missingKeys.length > 0) {
  console.warn(
    "Firebase env vars missing:",
    missingKeys.join(", "),
    "— fill them in your .env and restart the dev server."
  );
}

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

let analytics;
if (typeof window !== "undefined" && firebaseConfig.measurementId) {
  isSupported()
    .then((supported) => {
      if (supported) analytics = getAnalytics(app);
    })
    .catch(() => {
      analytics = undefined;
    });
}

export { app, auth, db, analytics };