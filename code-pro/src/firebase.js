import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDw_G1RKRgJ1oOOGtg3JTCncq0YpKsOddI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quipu-c6fdb.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://quipu-c6fdb-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quipu-c6fdb",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quipu-c6fdb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "325123147645",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:325123147645:web:8631a54daf5f595e632e14"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Listen to bot active status
export function listenBotStatus(callback) {
  const statusRef = ref(db, "bot_status");
  return onValue(statusRef, (snapshot) => {
    const val = snapshot.val();
    if (val && typeof val === "object") {
      callback(Boolean(val.is_active));
    } else if (typeof val === "boolean") {
      callback(val);
    } else {
      callback(false);
    }
  });
}

// Set bot active status
export async function setRemoteBotStatus(isActive) {
  const statusRef = ref(db, "bot_status");
  await set(statusRef, {
    is_active: isActive,
    updated_at: Date.now()
  });
}

// Listen to questions list
export function listenQuestions(callback) {
  const questionsRef = ref(db, "questions");
  return onValue(questionsRef, (snapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
}

// Delete a single question
export async function deleteQuestion(questionId) {
  const qRef = ref(db, `questions/${questionId}`);
  await remove(qRef);
}

// Clear all questions
export async function clearAllQuestions() {
  const qRef = ref(db, "questions");
  await remove(qRef);
}
