import fs from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const [, , keyPath, userEmail] = process.argv;

if (!keyPath || !userEmail) {
  console.error(
    "Usage: node scripts/checkAdminClaim.mjs <path-to-service-account-json> <admin-email>"
  );
  process.exit(1);
}

const serviceAccountRaw = fs.readFileSync(keyPath, "utf8");
const serviceAccount = JSON.parse(serviceAccountRaw);

initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();

try {
  const user = await auth.getUserByEmail(userEmail);
  console.log("email:", user.email);
  console.log("uid:", user.uid);
  console.log("customClaims:", user.customClaims || {});
  console.log("project_id:", serviceAccount.project_id);
} catch (error) {
  console.error("Failed to fetch user claim:", error.message);
  process.exit(1);
}
