import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { createSkill, deleteSkill, listSkills, updateSkill } from "@/lib/contentApi";
import { useAdminMode } from "@/contexts/AdminModeContext";
import { useAuth } from "@/contexts/AuthContext";


const fallbackSkills = [

    // Frontend skills

    {name: "HTML/CSS",level: 80,category: "Frontend"},
    {name: "JavaScript",level: 50,category: "Frontend"},
    {name: "React",level: 60,category: "Frontend"},

    // Backend skills
    {name: "Node.js",level: 50,category: "Backend"},
    {name: "Express.js",level: 50,category: "Backend"},
    {name: "MongoDB",level: 30,category: "Backend"},
    {name: "MySQL",level: 50,category: "Backend"},
    {name: "PhP",level: 55,category: "Backend"},
    {name: "Laravel",level: 50,category: "Backend"},

    // Tools
    {name: "Git/Github",level: 50,category: "Tools"},
    {name: "Postman",level: 30,category: "Tools"},
];

export const SkillsSection = () => {
    const { editMode } = useAdminMode();
    const { isAdmin } = useAuth();

    const [activeCategory, setActiveCategory] = useState("all");
    const [skills, setSkills] = useState(fallbackSkills);
    const [saving, setSaving] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [message, setMessage] = useState("");
    const [editingSkillId, setEditingSkillId] = useState("");
    const [form, setForm] = useState({
        name: "",
        level: 50,
        category: "Frontend",
        order: 1,
    });

    const fetchSkills = async () => {
        try {
            const items = await listSkills();
            if (Array.isArray(items) && items.length > 0) {
                setSkills(items);
            } else if (items.length === 0) {
                setSkills([]);
            }
        } catch (err) {
            console.error("Failed to load Firestore skills:", err);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const beginEdit = (skill) => {
        setEditingSkillId(skill.id ?? "");
        setForm({
            name: skill.name ?? "",
            level: Number.isFinite(skill.level) ? skill.level : 50,
            category: skill.category ?? "Frontend",
            order: Number.isFinite(skill.order) ? skill.order : 1,
        });
    };

    const resetForm = () => {
        setEditingSkillId("");
        setForm({
            name: "",
            level: 50,
            category: "Frontend",
            order: skills.length + 1,
        });
    };

    const handleSave = async (event) => {
        event.preventDefault();
        if (!isAdmin || !editMode) return;

        setSaving(true);
        setMessage("");
        try {
            const payload = {
                name: form.name.trim(),
                level: Number(form.level) || 0,
                category: form.category,
                order: Number(form.order) || 1,
            };

            if (editingSkillId) {
                await updateSkill(editingSkillId, payload);
                setMessage("Skill updated");
            } else {
                await createSkill(payload);
                setMessage("Skill created");
            }

            resetForm();
            await fetchSkills();
        } catch (err) {
            console.error(err);
            setMessage(err?.message ?? "Failed to save skill");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (skill) => {
        if (!isAdmin || !editMode || !skill?.id) return;
        if (!window.confirm(`Delete skill \"${skill.name}\"?`)) return;

        setMessage("");
        try {
            await deleteSkill(skill.id);
            if (editingSkillId === skill.id) resetForm();
            setMessage("Skill deleted");
            await fetchSkills();
        } catch (err) {
            console.error(err);
            setMessage(err?.message ?? "Failed to delete skill");
        }
    };

    const seedDefaultSkills = async () => {
        if (!isAdmin || !editMode) return;
        setSeeding(true);
        setMessage("");
        try {
            for (let index = 0; index < fallbackSkills.length; index += 1) {
                const skill = fallbackSkills[index];
                await createSkill({
                    ...skill,
                    order: index + 1,
                });
            }
            setMessage("Default skills added");
            await fetchSkills();
        } catch (err) {
            console.error(err);
            setMessage(err?.message ?? "Failed to seed skills");
        } finally {
            setSeeding(false);
        }
    };

    const filteredSkills = skills.filter(skill => activeCategory === "all" || skill.category === activeCategory);

    const visibleCategories = [
        "all",
        ...Array.from(new Set(skills.map((s) => s.category).filter(Boolean))),
    ];

    return <section 
    id="skills" 
    className="py-24 px-4 relative bg-secondary/3"
    >

    <div className="container mx-auto max-w-5xl ">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            My <span className="text-primary"> Skills</span>
        </h2>

        {isAdmin && editMode ? (
            <form onSubmit={handleSave} className="mb-10 p-5 rounded-lg bg-card text-left">
                <h3 className="text-xl font-semibold mb-4">
                    {editingSkillId ? "Edit Skill" : "Add Skill"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Name</label>
                        <input
                            className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Level</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                            value={form.level}
                            onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Category</label>
                        <input
                            className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                            value={form.category}
                            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Order</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                            value={form.order}
                            onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))}
                            required
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-5">
                    <button type="submit" className="button" disabled={saving}>
                        {saving ? "Saving..." : editingSkillId ? "Update Skill" : "Create Skill"}
                    </button>
                    {editingSkillId ? (
                        <button
                            type="button"
                            className="px-5 py-2 rounded-full bg-secondary/70 text-foreground"
                            onClick={resetForm}
                        >
                            Cancel Edit
                        </button>
                    ) : null}
                </div>
                {message ? <p className="text-sm text-muted-foreground mt-3">{message}</p> : null}
            </form>
        ) : null}

        <div className="flex flex-wrap justify-center gap-4 mb-12">
            {visibleCategories.map((category, key) => (
                <button 
                onClick={() => setActiveCategory(category)}
                key={key} className={cn(
                    "px-5 py-2 rounded-full transition-colors duration-300 capitalize",
                    activeCategory === category ? "bg-primary text-primary-foreground" : "bg-secondary/70 text-foreground hover:bg-secondary"
                    )}>
                {category}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) =>(
                <div key={skill.id ?? `${skill.name}-${skill.category}`} className="bg-card p-6 rounded-lg shadow-xs card-hover">

                    <div className="text-left mb-4">
                        <h3 className="font-semibold text-lg">{skill.name}</h3>
                    </div>

                    <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full origin-left animate-[grow_1.5s_ease-out]" style={{ width: `${skill.level}%` }}></div>
                    </div>

                    <div className="text-right mt-1">
                        <span className="text-sm text-muted-foreground">{skill.level}%</span>
                    </div>

                    {isAdmin && editMode && skill.id ? (
                        <div className="flex items-center justify-end gap-2 mt-4">
                            <button
                                type="button"
                                className="px-3 py-1 rounded-full bg-secondary/70 text-foreground text-xs"
                                onClick={() => beginEdit(skill)}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1 rounded-full bg-secondary/70 text-foreground text-xs"
                                onClick={() => handleDelete(skill)}
                            >
                                Delete
                            </button>
                        </div>
                    ) : null}

                </div>
            ))}

        </div>

        {filteredSkills.length === 0 ? (
            <div className="mt-8 text-center">
                <p className="text-muted-foreground">No skills found yet.</p>
                {isAdmin && editMode ? (
                    <button
                        type="button"
                        className="mt-3 px-5 py-2 rounded-full bg-secondary/70 text-foreground"
                        onClick={seedDefaultSkills}
                        disabled={seeding}
                    >
                        {seeding ? "Adding defaults..." : "Seed Default Skills"}
                    </button>
                ) : null}
            </div>
        ) : null}

    </div>

    </section>

};
