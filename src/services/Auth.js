import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

const normalizeContact = (contact) => contact.replace(/[\s-]/g, "");
const toLoginEmail = (contact) => `${normalizeContact(contact)}@users.fleurdelis.app`;

// AuthPage shows err.message, so turn Firebase's error codes into plain sentences
function friendly(err) {
  switch (err?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return new Error("Contact number or password is incorrect.");
    case "auth/email-already-in-use":
      return new Error("An account with this contact number already exists. Log in instead.");
    case "auth/weak-password":
      return new Error("Password must be at least 8 characters.");
    case "auth/too-many-requests":
      return new Error("Too many attempts. Try again in a few minutes.");
    case "auth/network-request-failed":
      return new Error("Can't reach the server. Check your connection and try again.");
    case "auth/operation-not-allowed":
      return new Error("This sign-in method isn't enabled yet. Ask the team to turn it on in Firebase.");
    default:
      console.error(err); // full details for debugging
      return new Error("Something went wrong. Please try again.");
  }
}

export async function logIn({ contact, password }) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, toLoginEmail(contact), password);
    return user;
  } catch (err) {
    throw friendly(err);
  }
}

export async function signUp({ firstName, lastName, contact, email, password }) {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, toLoginEmail(contact), password);
    await updateProfile(user, { displayName: `${firstName.trim()} ${lastName.trim()}` });

    // profile details live in Firestore at users/{uid}
    await setDoc(doc(db, "users", user.uid), {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      contact: normalizeContact(contact),
      email: email.trim() || null,
      createdAt: serverTimestamp(),
    });
    return user;
  } catch (err) {
    throw friendly(err);
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

export function logOut() {
  return signOut(auth);
}


export function watchUser(callback) {
  return onAuthStateChanged(auth, callback);
}