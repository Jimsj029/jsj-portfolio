const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "").trim();
const uploadPreset = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "").trim();
const apiKey = (import.meta.env.VITE_CLOUDINARY_API_KEY || "").trim();
const uploadFolder =
  (import.meta.env.VITE_CLOUDINARY_UPLOAD_FOLDER || "portfolio/projects").trim();
const uploadMode = (import.meta.env.VITE_CLOUDINARY_UPLOAD_MODE || "signed")
  .trim()
  .toLowerCase();
const signEndpoint =
  (import.meta.env.VITE_CLOUDINARY_SIGN_ENDPOINT || "/api/cloudinary/sign-upload").trim();
const deleteEndpoint =
  (import.meta.env.VITE_CLOUDINARY_DELETE_ENDPOINT || "/api/cloudinary/delete-image").trim();

const isPlaceholder = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return !normalized || normalized.startsWith("your_") || normalized.includes("your_");
};

async function parseErrorResponse(response, fallbackPrefix) {
  const detailsText = await response.text();
  try {
    const details = JSON.parse(detailsText);
    const msg = details?.error?.message || details?.error || detailsText;
    if (/unknown api key/i.test(msg)) {
      throw new Error(
        "Cloudinary rejected upload: Unknown API key. For signed mode, verify server env CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET; for unsigned mode, verify preset/cloud name."
      );
    }
    if (/unsigned|preset/i.test(msg)) {
      throw new Error(
        `Cloudinary upload failed: ${msg}. For unsigned mode, set preset to Unsigned. For signed mode, use upload mode 'signed'.`
      );
    }
    throw new Error(`${fallbackPrefix}: ${msg}`);
  } catch (parseErr) {
    if (parseErr instanceof Error) throw parseErr;
    throw new Error(`${fallbackPrefix}: ${detailsText}`);
  }
}

async function uploadUnsigned(file) {
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
    await parseErrorResponse(response, "Cloudinary upload failed");
  }

  const data = await response.json();
  return {
    imageUrl: data.secure_url,
    imagePublicId: data.public_id,
  };
}

async function uploadSigned(file, idToken) {
  if (!idToken) {
    throw new Error("Admin token missing. Please sign in again before uploading.");
  }

  const signRes = await fetch(signEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ folder: uploadFolder }),
  });

  if (!signRes.ok) {
    const details = await signRes.text();
    throw new Error(`Upload signature failed: ${details}`);
  }

  const signed = await signRes.json();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signed.apiKey);
  formData.append("timestamp", String(signed.timestamp));
  formData.append("signature", signed.signature);
  formData.append("folder", signed.folder || uploadFolder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    await parseErrorResponse(response, "Cloudinary signed upload failed");
  }

  const data = await response.json();
  return {
    imageUrl: data.secure_url,
    imagePublicId: data.public_id,
  };
}

export async function uploadProjectImage(file, idToken) {
  if (uploadMode === "unsigned") {
    return uploadUnsigned(file);
  }
  return uploadSigned(file, idToken);
}

export async function deleteProjectImage(publicId, idToken) {
  if (!publicId) return;
  if (!deleteEndpoint) return;
  if (!idToken) {
    throw new Error("Admin token missing. Please sign in again before deleting images.");
  }

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
