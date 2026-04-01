const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "").trim();
const uploadPreset = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "").trim();
const apiKey = (import.meta.env.VITE_CLOUDINARY_API_KEY || "").trim();
const uploadFolder =
  (import.meta.env.VITE_CLOUDINARY_UPLOAD_FOLDER || "portfolio/projects").trim();
const deleteEndpoint = import.meta.env.VITE_CLOUDINARY_DELETE_ENDPOINT;

const isPlaceholder = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return !normalized || normalized.startsWith("your_") || normalized.includes("your_");
};

export async function uploadProjectImage(file) {
  if (isPlaceholder(cloudName) || isPlaceholder(uploadPreset)) {
    throw new Error(
      "Cloudinary config missing. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET, then restart the dev server."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  if (apiKey) formData.append("api_key", apiKey);
  formData.append("folder", uploadFolder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const detailsText = await response.text();
    try {
      const details = JSON.parse(detailsText);
      const msg = details?.error?.message || detailsText;
      if (/unknown api key/i.test(msg)) {
        throw new Error(
          "Cloudinary rejected upload: Unknown API key. Check preset/cloud name, and if needed add VITE_CLOUDINARY_API_KEY from Cloudinary API Keys, then restart the dev server."
        );
      }
      if (/unsigned|preset/i.test(msg)) {
        throw new Error(
          `Cloudinary upload failed: ${msg}. In Cloudinary > Settings > Upload Presets, set this preset to Unsigned.`
        );
      }
      throw new Error(`Cloudinary upload failed: ${msg}`);
    } catch (parseErr) {
      if (parseErr instanceof Error) throw parseErr;
      throw new Error(`Cloudinary upload failed: ${detailsText}`);
    }
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
