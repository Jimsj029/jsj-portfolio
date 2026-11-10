import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminMode } from "@/contexts/AdminModeContext";

export function AdminControls() {
  const { isAdmin, loading, user, signOut } = useAuth();
  const { editMode, toggleEditMode } = useAdminMode();
  const [saveHint, setSaveHint] = useState("");

  const submitActiveForm = () => {
    if (!editMode) return;

    const activeForm = document.activeElement?.closest?.("form");
    const fallbackForm = document.querySelector("form");
    const targetForm = activeForm || fallbackForm;

    if (!targetForm) {
      setSaveHint("No editable section form found.");
      return;
    }

    targetForm.requestSubmit();
    setSaveHint("Saving current section...");
    window.setTimeout(() => setSaveHint(""), 1800);
  };

  if (loading || !user || !isAdmin) return null;

  return (
    <div className="fixed top-5 left-5 z-[70] flex flex-col items-start gap-2">
      <div className="flex items-center gap-2">
      <button
        type="button"
        className={
          editMode
            ? "px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium transition-all duration-300"
            : "px-4 py-2 rounded-full bg-secondary/70 text-foreground font-medium transition-colors duration-300 hover:bg-secondary"
        }
        onClick={toggleEditMode}
      >
        Edit: {editMode ? "On" : "Off"}
      </button>
      <button
        type="button"
        className={
          editMode
            ? "px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium transition-colors duration-300 hover:opacity-90"
            : "px-4 py-2 rounded-full bg-secondary/70 text-muted-foreground font-medium transition-colors duration-300"
        }
        onClick={submitActiveForm}
        disabled={!editMode}
      >
        Save
      </button>
      <button
        type="button"
        className="px-4 py-2 rounded-full bg-secondary/70 text-foreground font-medium transition-colors duration-300 hover:bg-secondary"
        onClick={() => signOut()}
      >
        Sign out
      </button>
      </div>
      {saveHint ? (
        <p className="text-xs text-muted-foreground bg-card/90 px-3 py-1 rounded-md">
          {saveHint}
        </p>
      ) : null}
    </div>
  );
}
