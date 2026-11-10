import fs from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const [, , keyPath] = process.argv;

if (!keyPath) {
  console.error("Usage: node scripts/publishLegacyProjects.mjs <path-to-service-account-json>");
  process.exit(1);
}

const serviceAccountRaw = fs.readFileSync(keyPath, "utf8");
const serviceAccount = JSON.parse(serviceAccountRaw);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

try {
  const snapshot = await db.collection("projects").get();
  let updatedCount = 0;

  const batch = db.batch();
  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    if (typeof data.published === "undefined") {
      batch.update(docSnap.ref, { published: true });
      updatedCount += 1;
    }
  });

  if (updatedCount > 0) {
    await batch.commit();
  }

  console.log(`project_count: ${snapshot.size}`);
  console.log(`updated_missing_published: ${updatedCount}`);
  console.log(`project_id: ${serviceAccount.project_id}`);
  console.log("Done. Existing unpublished (published=false) projects were not changed.");
} catch (error) {
  console.error("Failed to publish legacy projects:", error.message);
  process.exit(1);
}
