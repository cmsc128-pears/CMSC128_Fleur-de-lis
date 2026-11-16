import { updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { watchUser } from "./Auth";

// Tells us who is logged in (or null if nobody). Returns a function that stops listening.
export function watchAuth(callback) {
  return watchUser(callback);
}

// Gets one user's profile document from Firestore
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : {};
}

// Saves changes to one user's profile document (merges, so other fields are kept)
// and syncs displayName on Firebase Auth when firstName/lastName are updated.
export async function updateUserProfile(uid, data) {
  await setDoc(
    doc(db, "users", uid),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  if (
    auth.currentUser &&
    auth.currentUser.uid === uid &&
    (data.firstName !== undefined || data.lastName !== undefined)
  ) {
    const displayName = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();
    if (displayName) {
      await updateProfile(auth.currentUser, { displayName }).catch(() => {});
    }
  }
}
