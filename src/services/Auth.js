import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

const normalizeEmail = (email) => (email || "").trim().toLowerCase();
const normalizeContact = (contact) => (contact || "").replace(/[\s-]/g, "");

function friendly(err) {
  switch (err?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return new Error("Email or password is incorrect.");
    case "auth/invalid-email":
      return new Error("Enter a valid email address.");
    case "auth/email-already-in-use":
      return new Error("An account with this email already exists.");
    case "auth/weak-password":
      return new Error("Password must be at least 8 characters.");
    case "auth/too-many-requests":
      return new Error("Too many attempts. Try again in a few minutes.");
    case "auth/network-request-failed":
      return new Error("Can't reach the server. Check your connection and try again.");
    default:
      console.error(err);
      return new Error("Something went wrong. Please try again.");
  }
}

export async function logIn({ email, password }) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
    return user;
  } catch (err) {
    throw friendly(err);
  }
}

export async function signUp({ firstName, lastName, contact, email, password }) {
  let user;
  try {
    ({ user } = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password));
    await updateProfile(user, { displayName: `${firstName.trim()} ${lastName.trim()}` });
  } catch (err) {
    throw friendly(err);
  }

  try {
    await setDoc(doc(db, "users", user.uid), {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizeEmail(email),
      contact: normalizeContact(contact) || null, // optional
      createdAt: serverTimestamp(),
    });
    return user;
  } catch (err) {
    // roll back so the user can retry with the same email
    await user.delete().catch(() => {});
    console.error("Firestore write failed:", err);
    throw new Error("Couldn't save your profile. Please try again.");
  }
}

export async function logInAsGuest() {
  try {
    const { user } = await signInAnonymously(auth);
    return user;
  } catch (err) {
    throw friendly(err);
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, normalizeEmail(email));
  } catch (err) {
    throw friendly(err);
  }
}

export function logOut() {
  return signOut(auth);
}

export function watchUser(callback) {
  return onAuthStateChanged(auth, callback);
}