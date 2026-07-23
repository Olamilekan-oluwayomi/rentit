import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (fetchError && fetchError.code === "PGRST116") {
      const { data: created, error: createError } = await supabase
        .from("profiles")
        .upsert(
          { id: user.id, full_name: user.user_metadata?.full_name || "" },
          { onConflict: "id" }
        )
        .select()
        .single();

      if (createError) {
        setLoading(false);
        return;
      }
      data = created;
    } else if (fetchError) {
      setLoading(false);
      return;
    }

    setProfile(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    (async () => {
      await fetchProfile();
    })();
  }, [fetchProfile]);

  return (
    <ProfileContext.Provider
      value={{ profile, setProfile, refreshProfile: fetchProfile, loading }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
}
