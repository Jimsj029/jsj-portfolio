import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const byOrderThenName = (a, b) => {
  const orderA = Number.isFinite(a?.order) ? a.order : 0;
  const orderB = Number.isFinite(b?.order) ? b.order : 0;
  if (orderA !== orderB) return orderA - orderB;
  const nameA = String(a?.name ?? a?.title ?? "");
  const nameB = String(b?.name ?? b?.title ?? "");
  return nameA.localeCompare(nameB);
};

export async function getProfileMain() {
  const snap = await getDoc(doc(db, "profile", "main"));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getSection(sectionId) {
  const snap = await getDoc(doc(db, "sections", sectionId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listSkills() {
  const q = query(collection(db, "skills"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  items.sort(byOrderThenName);
  return items;
}

export async function listProjects({ publishedOnly = true } = {}) {
  const base = collection(db, "projects");
  const q = publishedOnly
    ? query(base, where("published", "==", true), orderBy("order", "asc"))
    : query(base, orderBy("order", "asc"));

  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  items.sort(byOrderThenName);
  return items;
}
