import fs from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const [, , keyPath, userEmail] = process.argv;

if (!keyPath || !userEmail) {
  console.error(
    "Usage: node scripts/setAdminClaim.mjs <path-to-service-account-json> <admin-email>"
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
  await auth.setCustomUserClaims(user.uid, { admin: true });
  console.log(`admin=true claim set for ${user.email} (${user.uid})`);
  console.log("Sign out and sign back in to refresh your token.");
} catch (error) {
  console.error("Failed to set admin claim:", error.message);
  process.exit(1);
}
