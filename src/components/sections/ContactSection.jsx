import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { getSection, upsertSection } from "@/lib/contentApi";
import { useAdminMode } from "@/contexts/AdminModeContext";
import { useAuth } from "@/contexts/AuthContext";

const fallbackContact = {
  intro: "Have a question or want to work together? Feel free to reach out!",
  email: "sanjuanjimuel029@gmail.com",
  phone: "+63 926 660 2249",
  location: "Philippines",
};

export const ContactSection = () => {
  const { editMode } = useAdminMode();
  const { isAdmin } = useAuth();
  const contactApiBase = (import.meta.env.VITE_CONTACT_BACKEND_URL || "http://localhost:8080").replace(/\/$/, "");

  const [content, setContent] = useState(fallbackContact);
  const [form, setForm] = useState(fallbackContact);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "Portfolio inquiry",
    message: "",
    website: "",
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const contactStars = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        size: `${Math.random() * 2 + 1}px`,
        delay: `${Math.random() * 3}s`,
      })),
    []
  );

  useEffect(() => {
    let cancelled = false;
    getSection("contact")
      .then((data) => {
        if (cancelled || !data) return;
        const merged = {
          ...fallbackContact,
          ...data,
        };
        setContent(merged);
        setForm(merged);
      })
      .catch((err) => {
        console.error("Failed to load contact section:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!isAdmin || !editMode) return;

    setSaving(true);
    setMessage("");
    try {
      await upsertSection("contact", form);
      setContent(form);
      setMessage("Contact section saved");
    } catch (err) {
      console.error(err);
      setMessage(err?.message ?? "Failed to save contact section");
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmail = async (event) => {
    event.preventDefault();
    setSendingEmail(true);
    setEmailStatus("");

    try {
      const response = await fetch(`${contactApiBase}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to send email");
      }

      setEmailStatus("Your message has been sent successfully. I'll get back to you soon.");
      setContactForm({
        name: "",
        email: "",
        subject: "Portfolio inquiry",
        message: "",
        website: "",
      });
    } catch (error) {
      setEmailStatus(error?.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-4 relative bg-secondary/30 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-14 top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-10 bottom-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Get in <span className="text-primary">Touch</span>
        </h2>

        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          {content.intro}
        </p>

        {isAdmin && editMode ? (
          <form onSubmit={handleSave} className="mb-10 p-5 rounded-lg bg-card text-left max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Edit Contact Section</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Intro Text</label>
                <textarea
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1 min-h-20"
                  value={form.intro}
                  onChange={(e) => setForm((prev) => ({ ...prev, intro: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <input
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Phone</label>
                <input
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Location</label>
                <input
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-4">
              <button type="submit" className="button" disabled={saving}>
                {saving ? "Saving..." : "Save Contact"}
              </button>
              {message ? <p className="text-sm text-muted-foreground mt-2">{message}</p> : null}
            </div>
          </form>
        ) : null}

        <div className="grid gap-8 md:grid-cols-2 md:gap-10 items-start">
          <div className="space-y-8">
            <h3 className="text-2xl font-semibold mb-6 text-left">Contact Information</h3>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 rounded-xl bg-card/95 backdrop-blur-sm p-4 border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.12)]">
                <div className="p-3 rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Email</h4>
                  <p className="text-muted-foreground break-all">{content.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 rounded-xl bg-card/95 backdrop-blur-sm p-4 border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.12)]">
                <div className="p-3 rounded-full bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Phone</h4>
                  <p className="text-muted-foreground">{content.phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 rounded-xl bg-card/95 backdrop-blur-sm p-4 border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.12)]">
                <div className="p-3 rounded-full bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Location</h4>
                  <p className="text-muted-foreground">{content.location}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative isolate rounded-2xl bg-card/95 border border-primary/30 p-6 md:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.24)] text-left overflow-hidden backdrop-blur-sm">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.24),transparent_48%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_42%)]" />

              {contactStars.map((star) => (
                <span
                  key={star.id}
                  className="star animate-pulse-subtle"
                  style={{
                    width: star.size,
                    height: star.size,
                    left: star.x,
                    top: star.y,
                    animationDelay: star.delay,
                  }}
                />
              ))}

              <span className="meteor animate-meteor top-1/4 left-[55%] w-20 h-[2px] opacity-50" />
              <span className="meteor animate-meteor top-[68%] left-[20%] w-16 h-[2px] opacity-35 [animation-delay:2.2s]" />
            </div>

            <h3 className="text-2xl font-semibold mb-2">Send a Message</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Share your project details and I will respond through email.
            </p>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  tabIndex="-1"
                  autoComplete="off"
                  value={contactForm.website}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, website: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Your Name</label>
                <input
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                  value={contactForm.name}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Your Email</label>
                <input
                  type="email"
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                  value={contactForm.email}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Subject</label>
                <input
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, subject: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Message</label>
                <textarea
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1 min-h-28"
                  value={contactForm.message}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                  required
                />
              </div>

              <button type="submit" className="button w-full" disabled={sendingEmail}>
                {sendingEmail ? "Sending..." : "Send Email"}
              </button>

              {emailStatus ? <p className="text-sm text-muted-foreground">{emailStatus}</p> : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
