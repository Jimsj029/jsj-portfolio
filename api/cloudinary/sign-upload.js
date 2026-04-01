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

  try {
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const body = req.body || {};
    const folder =
      typeof body.folder === "string" && body.folder.trim()
        ? body.folder.trim()
        : "portfolio/projects";
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = signCloudinaryParams({ folder, timestamp }, apiSecret);

    return res.status(200).json({
      cloudName,
      apiKey,
      folder,
      timestamp,
      signature,
      resourceType: "image",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Sign failed" });
  }
}
