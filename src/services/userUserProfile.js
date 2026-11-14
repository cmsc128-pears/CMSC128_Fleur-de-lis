import { useEffect, useState } from "react";
import { watchAuth, getUserProfile } from "./userService";

// TEMP: set to true to view the Profile page without logging in.
const USE_MOCK = false;

const MOCK_PROFILE = {
  uid: "mock_user",
  firstName: "Test",
  lastName: "User",
  contactNumber: "0912 345 6789",
  email: "test@example.com",
  yourDesigns: [],
  likedDesigns: [],
};

export default function useUserProfile() {
  const [profile, setProfile] = useState(USE_MOCK ? MOCK_PROFILE : null);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState("");

  useEffect(() => {
    // skip Firebase entirely when using the mock
    if (USE_MOCK) return;

    const unsubscribe = watchAuth(async (user) => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const data = await getUserProfile(user.uid);
        setProfile({
          ...data,
          uid: user.uid,
          email: data.email || user.email,
          contactNumber: data.contactNumber || data.contact || "",
          yourDesigns: Array.isArray(data.yourDesigns) ? data.yourDesigns : [],
          likedDesigns: Array.isArray(data.likedDesigns) ? data.likedDesigns : [],
        });
      } catch (err) {
        console.error(err);
        setError("Could not load your profile.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return { profile, loading, error };
}