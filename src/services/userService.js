import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Tells us who is logged in (or null if nobody). Returns a function that stops listening.
export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// Gets one user's profile document from Firestore
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : {};
}

// Saves changes to one user's profile document (merges, so other fields are kept)
export async function updateUserProfile(uid, data) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}