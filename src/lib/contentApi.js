import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
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

export async function upsertSection(sectionId, data) {
  await setDoc(
    doc(db, "sections", sectionId),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function listSkills() {
  const snap = await getDocs(collection(db, "skills"));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  items.sort(byOrderThenName);
  return items;
}

export async function listProjects({ publishedOnly = true } = {}) {
  const snap = await getDocs(collection(db, "projects"));
  const allItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const filtered = publishedOnly
    ? allItems.filter((item) => item.published === true)
    : allItems;
  filtered.sort(byOrderThenName);
  return filtered;
}

export async function createSkill(data) {
  const payload = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "skills"), payload);
  return ref.id;
}

export async function updateSkill(skillId, data) {
  const payload = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  await updateDoc(doc(db, "skills", skillId), payload);
}

export async function deleteSkill(skillId) {
  await deleteDoc(doc(db, "skills", skillId));
}

export async function createProject(data) {
  const payload = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "projects"), payload);
  return ref.id;
}

export async function updateProject(projectId, data) {
  const payload = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  await updateDoc(doc(db, "projects", projectId), payload);
}

export async function deleteProject(projectId) {
  await deleteDoc(doc(db, "projects", projectId));
}
