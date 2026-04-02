/* eslint-env node */
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import BrevoTransport from "nodemailer-brevo-transport";

const app = express();
const port = Number(process.env.PORT || 8080);
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 1);

app.set("trust proxy", trustProxyHops);
app.disable("x-powered-by");

const frontendOrigins = String(process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || frontendOrigins.length === 0 || frontendOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS blocked for this origin"));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 120),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const contactLimiter = rateLimit({
  windowMs: Number(process.env.CONTACT_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
  max: Number(process.env.CONTACT_RATE_LIMIT_MAX || 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many contact attempts. Please try again later." },
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(globalLimiter);
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

const brevoApiKey = getRequiredEnv("BREVO_API_KEY");
const contactToEmail = getRequiredEnv("CONTACT_TO_EMAIL");
const contactFromEmail = getRequiredEnv("CONTACT_FROM_EMAIL");
const contactFromName = process.env.CONTACT_FROM_NAME?.trim() || "Portfolio Contact Form";
const maxNameLength = Number(process.env.CONTACT_MAX_NAME_LENGTH || 120);
const maxSubjectLength = Number(process.env.CONTACT_MAX_SUBJECT_LENGTH || 180);
const maxMessageLength = Number(process.env.CONTACT_MAX_MESSAGE_LENGTH || 3000);

const transporter = nodemailer.createTransport(new BrevoTransport({ apiKey: brevoApiKey }));

function sanitizeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isLengthValid(value, maxLength) {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
}

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/api/contact", contactLimiter, async (req, res) => {
  const website = String(req.body?.website || "").trim();
  if (website) {
    return res.status(400).json({ error: "Invalid form submission" });
  }

  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const subject = String(req.body?.subject || "").trim();
  const message = String(req.body?.message || "").trim();

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (
    !isLengthValid(name, maxNameLength) ||
    !isLengthValid(subject, maxSubjectLength) ||
    !isLengthValid(message, maxMessageLength)
  ) {
    return res.status(400).json({ error: "Input is too long or invalid" });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: "A valid email address is required" });
  }

  const safeName = sanitizeHtml(name);
  const safeEmail = sanitizeHtml(email);
  const safeSubject = sanitizeHtml(subject);
  const safeMessage = sanitizeHtml(message);
  const safeMessageHtml = safeMessage.replaceAll("\n", "<br />");
  const submittedAt = new Date().toUTCString();

  const html = `
    <div style="margin:0;padding:0;background:#eef2ff;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;visibility:hidden;">
        Portfolio inquiry from ${safeName}: ${safeSubject}
      </div>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#eef2ff;padding:32px 12px;font-family:Verdana,Arial,sans-serif;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:720px;background:#ffffff;border:1px solid #dbe4ff;border-radius:20px;overflow:hidden;box-shadow:0 16px 32px rgba(37,99,235,0.15);">
              <tr>
                <td style="padding:0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td width="34%" valign="top" style="background:linear-gradient(180deg,#312e81 0%,#1d4ed8 100%);padding:28px 20px;">
                        <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#bfdbfe;font-weight:700;">Get In Touch</p>
                        <h2 style="margin:0 0 14px 0;font-size:24px;line-height:1.2;color:#ffffff;font-weight:800;">New Lead</h2>
                        <p style="margin:0 0 24px 0;font-size:13px;line-height:1.6;color:#dbeafe;">Someone reached out from your portfolio contact form.</p>

                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(255,255,255,0.1);border:1px solid rgba(191,219,254,0.3);border-radius:12px;">
                          <tr>
                            <td style="padding:10px 12px;font-size:11px;color:#c7d2fe;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Submitted</td>
                          </tr>
                          <tr>
                            <td style="padding:0 12px 12px 12px;font-size:12px;line-height:1.5;color:#ffffff;">${submittedAt}</td>
                          </tr>
                        </table>
                      </td>

                      <td width="66%" valign="top" style="padding:26px 24px 22px 24px;background:#ffffff;">
                        <h1 style="margin:0 0 16px 0;font-size:28px;line-height:1.15;color:#0f172a;font-weight:800;">${safeSubject}</h1>

                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:14px;background:#f8faff;border:1px solid #dbeafe;border-radius:12px;">
                          <tr>
                            <td style="padding:12px 14px;">
                              <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#6366f1;font-weight:700;">Sender Name</p>
                              <p style="margin:0;font-size:15px;line-height:1.4;color:#111827;font-weight:700;">${safeName}</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:0 14px 12px 14px;">
                              <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#6366f1;font-weight:700;">Sender Email</p>
                              <p style="margin:0;font-size:14px;line-height:1.4;">
                                <a href="mailto:${safeEmail}" style="color:#1d4ed8;text-decoration:underline;">${safeEmail}</a>
                              </p>
                            </td>
                          </tr>
                        </table>

                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;">
                          <tr>
                            <td style="padding:14px;">
                              <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;font-weight:700;">Message</p>
                              <p style="margin:0;font-size:15px;line-height:1.75;color:#0f172a;">${safeMessageHtml}</p>
                            </td>
                          </tr>
                        </table>

                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:16px;">
                          <tr>
                            <td>
                              <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(subject)}" style="display:inline-block;background:#1d4ed8;border:1px solid #1e40af;border-radius:10px;padding:11px 16px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Reply to Sender</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: {
        name: contactFromName,
        address: contactFromEmail,
      },
      to: contactToEmail,
      replyTo: {
        name: safeName,
        address: email,
      },
      subject: `[Portfolio] ${subject}`,
      text: `New portfolio inquiry\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

app.use((err, _req, res, _next) => {
  if (err?.message === "CORS blocked for this origin") {
    return res.status(403).json({ error: "Origin is not allowed" });
  }
  return res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Contact backend running on port ${port}`);
});
