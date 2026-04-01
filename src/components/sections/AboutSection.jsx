import { useEffect, useState } from "react";
import { Code } from "lucide-react";
import { User } from "lucide-react";
import { Briefcase } from "lucide-react";
import { getSection, upsertSection } from "@/lib/contentApi";
import { useAdminMode } from "@/contexts/AdminModeContext";
import { useAuth } from "@/contexts/AuthContext";

const fallbackAbout = {
  heading:
    "I am a passionate web developer with hands-on experience in building responsive and user-friendly web applications using MERN stack.",
  paragraph1:
    "During my internship at Bulacan State University's Planning and Development Office, I contributed to frontend development and debugging tasks, gaining valuable exposure to real-world web development workflows and industry standards.",
  paragraph2:
    "I enjoy creating clean and functional designs, and I'm particularly interested in improving user experiences through responsive layouts and interactive features. Always eager to learn, I continuously explore modern tools and frameworks to grow my skills and contribute meaningfully to every project I join.",
  cvUrl: "/cv/Jimuel_Sanjuan_CV.pdf",
  cvFileName: "Jimuel_Sanjuan_CV.pdf",
};

export const AboutSection = () => {
  const { editMode } = useAdminMode();
  const { isAdmin } = useAuth();

  const [content, setContent] = useState(fallbackAbout);
  const [form, setForm] = useState(fallbackAbout);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    getSection("about")
      .then((data) => {
        if (cancelled || !data) return;
        const merged = {
          ...fallbackAbout,
          ...data,
        };
        setContent(merged);
        setForm(merged);
      })
      .catch((err) => {
        console.error("Failed to load about section:", err);
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
      await upsertSection("about", form);
      setContent(form);
      setMessage("About section saved");
    } catch (err) {
      console.error(err);
      setMessage(err?.message ?? "Failed to save about section");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="about" className="py-24 px-4 relative">
      {""}
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          About <span className="text-primary"> Me</span>
        </h2>

        {isAdmin && editMode ? (
          <form onSubmit={handleSave} className="mb-10 p-5 rounded-lg bg-card text-left">
            <h3 className="text-xl font-semibold mb-4">Edit About Section</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Heading</label>
                <textarea
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1 min-h-20"
                  value={form.heading}
                  onChange={(e) => setForm((prev) => ({ ...prev, heading: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Paragraph 1</label>
                <textarea
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1 min-h-24"
                  value={form.paragraph1}
                  onChange={(e) => setForm((prev) => ({ ...prev, paragraph1: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Paragraph 2</label>
                <textarea
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1 min-h-24"
                  value={form.paragraph2}
                  onChange={(e) => setForm((prev) => ({ ...prev, paragraph2: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">CV URL</label>
                  <input
                    className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                    value={form.cvUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, cvUrl: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">CV Download Name</label>
                  <input
                    className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                    value={form.cvFileName}
                    onChange={(e) => setForm((prev) => ({ ...prev, cvFileName: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button type="submit" className="button" disabled={saving}>
                {saving ? "Saving..." : "Save About"}
              </button>
              {message ? <p className="text-sm text-muted-foreground mt-2">{message}</p> : null}
            </div>
          </form>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">{content.heading}</h3>

            <p className="text-muted-foreground">{content.paragraph1}</p>

            <p className="text-muted-foreground">{content.paragraph2}</p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <a href="#contact" className="button">
                Get In Touch
              </a>

              <a
                href={content.cvUrl}
                download={content.cvFileName}
                className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors duration-300"
              >
                Download CV
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg"> Web Development</h4>
                  <p className="text-muted-foreground">
                    Creating responsive websites and web application with modern
                    frameworks
                  </p>
                </div>
              </div>
            </div>

            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg">UI/UX Design</h4>
                  <p className="text-muted-foreground">
                    Designing intuitive and engaging user interfaces with a
                    focus on user experience
                  </p>
                </div>
              </div>
            </div>

            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg">Project Management</h4>
                  <p className="text-muted-foreground">
                    Managing projects from concept to completion, ensuring
                    timely delivery and quality standards
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
