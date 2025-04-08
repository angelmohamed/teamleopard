// contexts/AuthContext.js
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const initAuth = async () => {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error.message);
      }
      if (active) {
        setUser(session?.user ?? null);
        setLoading(false);
        console.log("AuthContext: Initial user set to", session?.user);
      }

      // Listen for changes to auth state
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, changedSession) => {
        if (active) {
          setUser(changedSession?.user ?? null);
          setLoading(false);
          console.log("AuthContext: Auth state changed. User:", changedSession?.user);
        }
      });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
