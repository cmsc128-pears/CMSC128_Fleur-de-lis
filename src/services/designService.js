import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

// Gets all designs created by this user from Firestore (for Profile "Your Designs" tab).
export async function getUserDesigns(uid) {
  if (!uid) return [];
  const q = query(collection(db, "designs"), where("ownerId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Gets all designs liked by this user from Firestore (for Profile "Liked Designs" tab).
export async function getLikedDesigns(uid) {
  if (!uid) return [];
  const q = query(collection(db, "designs"), where("likedBy", "array-contains", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Saves a bouquet to Firestore `designs` and adds its new ID to `users/{uid}.yourDesigns`. Returns the saved object.
export async function saveDesign(uid, designData) {
  const payload = {
    ownerId: uid || "guest",
    name: designData.name || "Custom Bouquet",
    imageUrl: designData.imageUrl || "/src/assets/images/build-bouquet-sample.jpg",
    presetBouquetId: designData.presetBouquetId || null,
    items: {
      flowers: designData.items?.flowers || [],
      fillers: designData.items?.fillers || [],
      wrapperId: designData.items?.wrapperId || designData.items?.wrapper?.id || null,
      ribbonId: designData.items?.ribbonId || designData.items?.ribbon?.id || null,
      addOns: designData.items?.addOns || [],
    },
    totalPrice: designData.totalPrice ?? null,
    isPublic: designData.isPublic ?? true,
    likesCount: 0,
    likedBy: [],
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "designs"), payload);

  // Also add the design ID to the user's profile doc
  if (uid) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      yourDesigns: arrayUnion(docRef.id),
      updatedAt: serverTimestamp(),
    }).catch(() => {});
  }

  return { id: docRef.id, ...payload };
}

// Toggles a like on a design (updates `likedBy`, `likesCount`, and `users/{uid}.likedDesigns`). Returns `true` if liked, `false` if unliked.
export async function toggleLikeDesign(uid, designId) {
  if (!uid || !designId) {
    throw new Error("Must be logged in to like designs.");
  }

  const designRef = doc(db, "designs", designId);
  const snap = await getDoc(designRef);
  if (!snap.exists()) {
    throw new Error("Design not found.");
  }

  const data = snap.data();
  const alreadyLiked = Array.isArray(data.likedBy) && data.likedBy.includes(uid);
  const userRef = doc(db, "users", uid);

  if (alreadyLiked) {
    await updateDoc(designRef, {
      likedBy: arrayRemove(uid),
      likesCount: increment(-1),
    });
    await updateDoc(userRef, {
      likedDesigns: arrayRemove(designId),
      updatedAt: serverTimestamp(),
    }).catch(() => {});
    return false;
  } else {
    await updateDoc(designRef, {
      likedBy: arrayUnion(uid),
      likesCount: increment(1),
    });
    await updateDoc(userRef, {
      likedDesigns: arrayUnion(designId),
      updatedAt: serverTimestamp(),
    }).catch(() => {});
    return true;
  }
}
