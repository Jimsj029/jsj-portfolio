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
    <div style="margin:0;padding:0;background:#080d1a;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;visibility:hidden;">
        Portfolio inquiry from ${safeName}: ${safeSubject}
      </div>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:linear-gradient(160deg,#0a0f1e 0%,#0d1530 50%,#080d1a 100%);padding:40px 16px;font-family:Georgia,'Times New Roman',serif;">
        <tr>
          <td align="center">

            <!-- Header badge -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
              <tr>
                <td style="background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.4);border-radius:999px;padding:6px 18px;">
                  <span style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a78bfa;font-weight:700;font-family:Verdana,Arial,sans-serif;">&#10022; &nbsp; New Portfolio Inquiry &nbsp; &#10022;</span>
                </td>
              </tr>
            </table>

            <!-- Main card -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:660px;background:linear-gradient(135deg,#111827 0%,#0f172a 100%);border:1px solid rgba(139,92,246,0.35);border-radius:24px;overflow:hidden;box-shadow:0 0 60px rgba(139,92,246,0.2),0 24px 48px rgba(0,0,0,0.6);">

              <!-- Hero banner -->
              <tr>
                <td style="padding:0;overflow:hidden;">
                  <div style="position:relative;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#1e3a8a 100%);padding:40px 32px 36px;overflow:hidden;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td>
                          <p style="margin:0 0 6px 0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#818cf8;font-weight:700;font-family:Verdana,Arial,sans-serif;">Get In Touch</p>
                          <h1 style="margin:0 0 10px 0;font-size:36px;line-height:1.1;color:#ffffff;font-weight:400;letter-spacing:-0.5px;">New Lead</h1>
                          <p style="margin:0 0 24px 0;font-size:14px;line-height:1.65;color:#a5b4fc;font-family:Verdana,Arial,sans-serif;">Someone reached out from your portfolio contact form.</p>

                          <!-- Submitted timestamp pill -->
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;">
                            <tr>
                              <td style="background:rgba(255,255,255,0.07);border:1px solid rgba(165,180,252,0.25);border-radius:12px;padding:10px 16px;">
                                <p style="margin:0 0 3px 0;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#818cf8;font-weight:700;font-family:Verdana,Arial,sans-serif;">Submitted</p>
                                <p style="margin:0;font-size:13px;color:#e0e7ff;font-family:Verdana,Arial,sans-serif;">${submittedAt}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- Gradient divider -->
              <tr>
                <td style="padding:0;font-size:0;line-height:0;">
                  <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(139,92,246,0.6),rgba(59,130,246,0.6),transparent);"></div>
                </td>
              </tr>

              <!-- Content body -->
              <tr>
                <td style="padding:32px 32px 28px;">

                  <!-- Subject line -->
                  <h2 style="margin:0 0 24px 0;font-size:26px;line-height:1.2;color:#f1f5f9;font-weight:400;letter-spacing:-0.3px;">${safeSubject}</h2>

                  <!-- Sender info card -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px;background:rgba(139,92,246,0.06);border:1px solid rgba(139,92,246,0.25);border-radius:14px;overflow:hidden;">
                    <tr>
                      <td style="padding:16px 18px 0 18px;">
                        <p style="margin:0 0 4px 0;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#a78bfa;font-weight:700;font-family:Verdana,Arial,sans-serif;">Sender Name</p>
                        <p style="margin:0 0 16px 0;font-size:17px;color:#f1f5f9;font-weight:400;">${safeName}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 18px;height:1px;background:rgba(139,92,246,0.15);font-size:0;line-height:0;">&nbsp;</td>
                    </tr>
                    <tr>
                      <td style="padding:16px 18px;">
                        <p style="margin:0 0 4px 0;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#a78bfa;font-weight:700;font-family:Verdana,Arial,sans-serif;">Sender Email</p>
                        <a href="mailto:${safeEmail}" style="font-size:15px;color:#818cf8;text-decoration:none;font-family:Verdana,Arial,sans-serif;">${safeEmail}</a>
                      </td>
                    </tr>
                  </table>

                  <!-- Message card -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;background:rgba(255,255,255,0.03);border:1px solid rgba(100,116,139,0.25);border-radius:14px;">
                    <tr>
                      <td style="padding:16px 18px;">
                        <p style="margin:0 0 8px 0;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#94a3b8;font-weight:700;font-family:Verdana,Arial,sans-serif;">Message</p>
                        <p style="margin:0;font-size:15px;line-height:1.8;color:#cbd5e1;font-family:Verdana,Arial,sans-serif;">${safeMessageHtml}</p>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA button -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:999px;box-shadow:0 0 20px rgba(139,92,246,0.45);">
                        <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(subject)}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.03em;font-family:Verdana,Arial,sans-serif;">Reply to Sender &#8594;</a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer strip -->
              <tr>
                <td style="padding:0;">
                  <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(139,92,246,0.3),transparent);"></div>
                  <div style="background:rgba(139,92,246,0.04);padding:16px 32px;">
                    <p style="margin:0;font-size:11px;color:#475569;text-align:center;font-family:Verdana,Arial,sans-serif;letter-spacing:0.05em;">Jimuel A. San Juan &middot; Portfolio Contact Form &middot; Auto-generated notification</p>
                  </div>
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