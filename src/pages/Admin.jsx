import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signIn, signOut, refreshClaims } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signIn(email, password);
      await refreshClaims();
      navigate("/");
    } catch (err) {
      setError(err?.message ?? "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="bg-card rounded-lg p-6 shadow-xs w-full max-w-md text-left">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="bg-card rounded-lg p-6 shadow-xs w-full max-w-md text-left">
        <h1 className="text-2xl font-bold mb-2">Admin</h1>
        <p className="text-muted-foreground mb-6">
          Sign in to enable admin edit mode.
        </p>

        {user ? (
          <div className="space-y-4">
            <div className="text-sm">
              Signed in as <span className="font-semibold">{user.email}</span>
            </div>

            {isAdmin ? (
              <div className="text-sm text-muted-foreground">
                Admin access: enabled.
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Admin access: not enabled for this account yet.
              </div>
            )}

            <div className="flex gap-3">
              <button className="button" onClick={() => navigate("/")}
              type="button">
                Go Home
              </button>
              <button
                className="px-6 py-2 rounded-full bg-secondary/70 text-foreground font-medium transition-colors duration-300 hover:bg-secondary"
                onClick={() => signOut()}
                type="button"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Email</label>
              <input
                className="w-full rounded-md bg-secondary/70 px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Password</label>
              <input
                className="w-full rounded-md bg-secondary/70 px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error ? (
              <div className="text-sm text-muted-foreground">{error}</div>
            ) : null}

            <button className="button" type="submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
