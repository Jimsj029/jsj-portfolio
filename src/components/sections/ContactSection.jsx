import { useEffect, useState } from "react";
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

  const [content, setContent] = useState(fallbackContact);
  const [form, setForm] = useState(fallbackContact);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

  return (
    <section id="contact" className="py-24 px-4 relative bg-secondary/30">
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

        <div className="flex justify-center">
          <div className="space-y-8 max-w-md">
            <h3 className="text-2xl font-semibold mb-6 text-center">
              Contact Information
            </h3>

            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <h4 className="font-medium">Email</h4>
                  <p className="text-muted-foreground">{content.email}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <h4 className="font-medium">Phone</h4>
                  <p className="text-muted-foreground">{content.phone}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <h4 className="font-medium">Location</h4>
                  <p className="text-muted-foreground">{content.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
