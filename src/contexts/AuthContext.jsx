import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  getIdTokenResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const token = await getIdTokenResult(nextUser);
        setIsAdmin(token?.claims?.admin === true);
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      loading,
      async signIn(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
      },
      async signOut() {
        return signOut(auth);
      },
      async refreshClaims() {
        if (!auth.currentUser) return false;
        try {
          const token = await getIdTokenResult(auth.currentUser, true);
          const nextIsAdmin = token?.claims?.admin === true;
          setIsAdmin(nextIsAdmin);
          return nextIsAdmin;
        } catch {
          setIsAdmin(false);
          return false;
        }
      },
    }),
    [user, isAdmin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
