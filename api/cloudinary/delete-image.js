import { requireAdmin } from "../_lib/auth.js";
import {
  getCloudinaryConfig,
  signCloudinaryParams,
} from "../_lib/cloudinary-signature.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.message });
  }

  const publicId = req.body?.publicId;
  if (!publicId || typeof publicId !== "string") {
    return res.status(400).json({ error: "publicId is required" });
  }

  try {
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = signCloudinaryParams(
      {
        public_id: publicId,
        timestamp,
      },
      apiSecret
    );

    const body = new URLSearchParams({
      public_id: publicId,
      timestamp: String(timestamp),
      api_key: apiKey,
      signature,
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(400).json({ error: data?.error?.message || "Delete failed" });
    }

    return res.status(200).json({ result: data.result || "ok" });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Delete failed" });
  }
}
