import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app;
let db;
let isFirebaseAvailable = false;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseAvailable = true;
    console.log("Firebase initialized successfully with credentials.");
  } else {
    console.warn("Firebase credentials missing, running in offline mock mode.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
}

// Utility to save logs to Firebase if available, otherwise save to localStorage
export const saveAuditLog = async (logEntry) => {
  const timestamp = new Date().toISOString();
  const entry = { ...logEntry, timestamp };

  if (isFirebaseAvailable && db) {
    try {
      const logsRef = collection(db, "audit_logs");
      await addDoc(logsRef, entry);
      console.log("Saved audit log to Firebase:", entry);
      return true;
    } catch (e) {
      console.error("Error writing to Firebase Firestore:", e);
    }
  }

  // Fallback to localStorage
  try {
    const offlineLogs = JSON.parse(localStorage.getItem("forensic_audit_logs") || "[]");
    offlineLogs.push(entry);
    localStorage.setItem("forensic_audit_logs", JSON.stringify(offlineLogs));
    console.log("Saved audit log locally:", entry);
  } catch (e) {
    console.error("Failed to write to localStorage:", e);
  }
  return false;
};

// Utility to fetch logs
export const getAuditLogs = async () => {
  if (isFirebaseAvailable && db) {
    try {
      const logsRef = collection(db, "audit_logs");
      const q = query(logsRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const logs = [];
      querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      return logs;
    } catch (e) {
      console.error("Error reading from Firebase Firestore:", e);
    }
  }

  // Fallback to localStorage
  try {
    const offlineLogs = JSON.parse(localStorage.getItem("forensic_audit_logs") || "[]");
    return offlineLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (e) {
    console.error("Failed to read local storage logs:", e);
    return [];
  }
};

export { app, db, isFirebaseAvailable };
export default db;
