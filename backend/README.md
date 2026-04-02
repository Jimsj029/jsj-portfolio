# Contact Backend (Railway + Brevo API)

This backend is separated from your Vite frontend and is intended for Railway deployment.

## Why this setup

- Uses **Brevo API key**, not SMTP, to avoid Railway SMTP blocking.
- Uses Nodemailer with `nodemailer-brevo-transport`.
- Exposes one endpoint for your contact form: `POST /api/contact`.
- Adds security hardening with Helmet, strict CORS, and disabled `x-powered-by` header.
- Adds IP-based rate limiting globally and stricter limits on the contact endpoint.

## 1) Install and run locally

```bash
cd backend
npm install
npm run dev
```

Server starts on `http://localhost:8080` by default.

## 2) Environment variables

Copy `.env.example` to `.env` and fill values:

- `PORT`
- `FRONTEND_ORIGIN` (for local Vite: `http://localhost:5173`; can be comma-separated)
- `TRUST_PROXY_HOPS` (Railway is behind proxy; default `1`)
- `RATE_LIMIT_WINDOW_MS` (global window; default `900000`)
- `RATE_LIMIT_MAX` (global max requests per IP; default `120`)
- `CONTACT_RATE_LIMIT_WINDOW_MS` (contact window; default `600000`)
- `CONTACT_RATE_LIMIT_MAX` (contact max requests per IP; default `5`)
- `BREVO_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- `CONTACT_FROM_NAME`
- `CONTACT_MAX_NAME_LENGTH` (default `120`)
- `CONTACT_MAX_SUBJECT_LENGTH` (default `180`)
- `CONTACT_MAX_MESSAGE_LENGTH` (default `3000`)

## 3) Endpoint

### POST `/api/contact`

Body JSON:

```json
{
  "name": "Your Name",
  "email": "you@example.com",
  "subject": "Project Inquiry",
  "message": "Hello..."
}
```

Success:

```json
{ "ok": true }
```

Security behavior:

- Rejects requests that exceed configured field length limits.
- Rejects invalid email formats.
- Uses a hidden anti-bot field (`website`) as a honeypot.
- Returns generic server errors without leaking internals.

## 4) Railway deployment

1. Create a new Railway project from this repo.
2. Set root directory to `backend`.
3. Add all environment variables from `.env.example`.
4. Use start command: `npm start`.
5. After deploy, copy Railway service URL.

## 5) Frontend wiring

Set this in your frontend environment file:

- `VITE_CONTACT_BACKEND_URL=https://your-railway-service.up.railway.app`

The contact form in the Get in Touch section will send requests to:

- `POST ${VITE_CONTACT_BACKEND_URL}/api/contact`
