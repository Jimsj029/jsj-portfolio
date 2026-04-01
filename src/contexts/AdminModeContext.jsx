import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "adminEditMode";

const AdminModeContext = createContext(null);

export function AdminModeProvider({ children }) {
  const { isAdmin } = useAuth();
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      setEditMode(false);
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    setEditMode(saved === "true");
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    localStorage.setItem(STORAGE_KEY, String(editMode));
  }, [isAdmin, editMode]);

  const value = useMemo(
    () => ({
      editMode: isAdmin ? editMode : false,
      setEditMode: isAdmin ? setEditMode : () => {},
      toggleEditMode() {
        if (!isAdmin) return;
        setEditMode((v) => !v);
      },
    }),
    [isAdmin, editMode]
  );

  return (
    <AdminModeContext.Provider value={value}>
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  const ctx = useContext(AdminModeContext);
  if (!ctx) throw new Error("useAdminMode must be used within <AdminModeProvider>");
  return ctx;
}
