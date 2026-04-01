import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { getSection, upsertSection } from "@/lib/contentApi";
import { useAdminMode } from "@/contexts/AdminModeContext";
import { useAuth } from "@/contexts/AuthContext";

const fallbackHero = {
    introPrefix: "Hi, I'm",
    firstName: "Jimuel",
    lastName: "A. San Juan",
    description:
        "Hi, I'm a passionate web developer with a focus on creating beautiful and functional user experiences. I love coding, learning new technologies, and building projects that are user-friendly.",
    ctaText: "View my Work",
    ctaHref: "#projects",
    scrollText: "Scroll",
};

export const HeroSection = () => {
    const { editMode } = useAdminMode();
    const { isAdmin } = useAuth();

    const [content, setContent] = useState(fallbackHero);
    const [form, setForm] = useState(fallbackHero);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        let cancelled = false;
        getSection("hero")
            .then((data) => {
                if (cancelled || !data) return;
                const merged = {
                    ...fallbackHero,
                    ...data,
                };
                setContent(merged);
                setForm(merged);
            })
            .catch((err) => {
                console.error("Failed to load hero section:", err);
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
            await upsertSection("hero", form);
            setContent(form);
            setMessage("Hero section saved");
        } catch (err) {
            console.error(err);
            setMessage(err?.message ?? "Failed to save hero section");
        } finally {
            setSaving(false);
        }
    };

    return <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center px-4"
    >
        <div className="container max-w-4xl mx-auto text-center z-10">
            {isAdmin && editMode ? (
                <form onSubmit={handleSave} className="mb-10 p-5 rounded-lg bg-card text-left max-w-3xl mx-auto">
                    <h3 className="text-xl font-semibold mb-4">Edit Hero Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-muted-foreground">Intro Prefix</label>
                            <input
                                className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                                value={form.introPrefix}
                                onChange={(e) => setForm((prev) => ({ ...prev, introPrefix: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">First Name</label>
                            <input
                                className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                                value={form.firstName}
                                onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Last Name</label>
                            <input
                                className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                                value={form.lastName}
                                onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Button Text</label>
                            <input
                                className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                                value={form.ctaText}
                                onChange={(e) => setForm((prev) => ({ ...prev, ctaText: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Button Link</label>
                            <input
                                className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                                value={form.ctaHref}
                                onChange={(e) => setForm((prev) => ({ ...prev, ctaHref: e.target.value }))}
                                placeholder="#projects"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Scroll Text</label>
                            <input
                                className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                                value={form.scrollText}
                                onChange={(e) => setForm((prev) => ({ ...prev, scrollText: e.target.value }))}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm text-muted-foreground">Description</label>
                            <textarea
                                className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1 min-h-24"
                                value={form.description}
                                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <button type="submit" className="button" disabled={saving}>
                            {saving ? "Saving..." : "Save Hero"}
                        </button>
                        {message ? <p className="text-sm text-muted-foreground mt-2">{message}</p> : null}
                    </div>
                </form>
            ) : null}

            <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                    <span className="opacity-0 animate-fade-in">{content.introPrefix} </span>
                    <span className="text-primary opacity-0 animate-fade-in-delay-1">
                        {""}
                        {content.firstName} </span>
                    <span className="text-gradient ml-2 opacity-0 animate-fade-in-delay-2">
                        {""}
                         {content.lastName}</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in-delay-3">
                    {content.description}
                </p>

                <div className="opacity-0 animate-fade-in-delay-4">
                    <a href={content.ctaHref} className="button">
                        {content.ctaText}
                    </a>
                </div>
            </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
        <span className="text-sm text-muted-foreground mb-2"> {content.scrollText} </span>
        <ArrowDown className="h-5 w-5 text-primary"/>
        </div>
    </section>
}