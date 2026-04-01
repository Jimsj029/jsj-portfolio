import { useAuth } from "@/contexts/AuthContext";
import { useAdminMode } from "@/contexts/AdminModeContext";

export function AdminControls() {
  const { isAdmin, loading, user, signOut } = useAuth();
  const { editMode, toggleEditMode } = useAdminMode();

  if (loading || !user || !isAdmin) return null;

  return (
    <div className="fixed top-5 left-5 z-[70] flex items-center gap-2">
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
        className="px-4 py-2 rounded-full bg-secondary/70 text-foreground font-medium transition-colors duration-300 hover:bg-secondary"
        onClick={() => signOut()}
      >
        Sign out
      </button>
    </div>
  );
}
