const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const uploadFolder =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_FOLDER || "portfolio/projects";
const deleteEndpoint = import.meta.env.VITE_CLOUDINARY_DELETE_ENDPOINT;

export async function uploadProjectImage(file) {
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary env vars are missing");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", uploadFolder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Cloudinary upload failed: ${details}`);
  }

  const data = await response.json();
  return {
    imageUrl: data.secure_url,
    imagePublicId: data.public_id,
  };
}

export async function deleteProjectImage(publicId, idToken) {
  if (!publicId) return;
  if (!deleteEndpoint) return;

  const response = await fetch(deleteEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify({ publicId }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Cloudinary delete failed: ${details}`);
  }
}
