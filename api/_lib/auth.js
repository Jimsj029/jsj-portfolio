import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function parseServiceAccount() {
  const raw = process.env.FIREBASE_ADMIN_SA_JSON;
  if (!raw) {
    throw new Error(
      "FIREBASE_ADMIN_SA_JSON is missing. Add full service account JSON in Vercel env vars."
    );
  }

  const parsed = JSON.parse(raw);
  if (typeof parsed.private_key === "string") {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }
  return parsed;
}

function getAdminAuth() {
  if (!getApps().length) {
    initializeApp({ credential: cert(parseServiceAccount()) });
  }
  return getAuth();
}

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== "string") return null;
  const [scheme, token] = header.split(" ");
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token;
}

export async function requireAdmin(req) {
  const token = getBearerToken(req);
  if (!token) {
    return { ok: false, status: 401, message: "Missing Bearer token" };
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    if (decoded.admin === true) {
      return { ok: true, uid: decoded.uid, email: decoded.email || null };
    }
    return { ok: false, status: 403, message: "Admin claim required" };
  } catch (error) {
    return { ok: false, status: 401, message: error.message || "Invalid token" };
  }
}
