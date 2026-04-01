import React, { useEffect, useState } from 'react';
import { ImageModal } from '../ImageModal';
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from '@/lib/contentApi';
import { uploadProjectImage, deleteProjectImage } from '@/lib/cloudinary';
import { useAdminMode } from '@/contexts/AdminModeContext';
import { useAuth } from '@/contexts/AuthContext';

const fallbackProjects = [
  {
    id: 1,
    title: "Basic Email Sender",
    description: "A simple email sender application",
    imageUrl: "/projects/emailsender.png",
    tags: ["React", "Node.js", "Nodemailer", "HTML/CSS"],
    order: 1,
    published: true,
  },
  {
    id: 2,
    title: "Basic Email Template Builder",
    description: "A simple email template builder application",
    imageUrl: "/projects/emailtemplatebuilder.png",
    tags: ["React", "Node.js", "Nodemailer", "HTML/CSS", "Quill.js"],
    order: 2,
    published: true,
  },
  {
    id: 3,
    title: "Basic Login System",
    description: "A simple login system application",
    imageUrl: "/projects/login.png",
    tags: ["Laravel", "HTML/CSS", "PHP", "MySQL"],
    order: 3,
    published: true,
  },
];

export const ProjectsSection = () => {
  const { editMode } = useAdminMode();
  const { isAdmin, getToken } = useAuth();

  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState(fallbackProjects);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [editingProjectId, setEditingProjectId] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: [],
    githubUrl: '',
    liveUrl: '',
    order: 1,
    published: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [tagInput, setTagInput] = useState('');

  const toTagList = (tags) => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === "string") {
      return tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
    return [];
  };

  const toSafeUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const items = await listProjects({ publishedOnly: !(isAdmin && editMode) });
      if (Array.isArray(items) && items.length > 0) {
        setProjects(items);
      } else if (items.length === 0) {
        setProjects([]);
      }
    } catch (err) {
      console.error("Failed to load Firestore projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [isAdmin, editMode]);

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      tags: [],
      githubUrl: '',
      liveUrl: '',
      order: projects.length + 1,
      published: true,
    });
    setTagInput('');
    setImageFile(null);
    setEditingProjectId('');
  };

  const beginEdit = (project) => {
    setEditingProjectId(project.id);
    setForm({
      title: project.title ?? '',
      description: project.description ?? '',
      tags: toTagList(project.tags),
      githubUrl: project.githubUrl ?? '',
      liveUrl: project.liveUrl ?? '',
      order: Number.isFinite(project.order) ? project.order : 1,
      published: project.published === true,
    });
    setTagInput('');
    setImageFile(null);
  };

  const addTag = () => {
    const nextTag = tagInput.trim();
    if (!nextTag) return;
    setForm((prev) => {
      if (prev.tags.some((tag) => tag.toLowerCase() === nextTag.toLowerCase())) {
        return prev;
      }
      return { ...prev, tags: [...prev.tags, nextTag] };
    });
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAdmin || !editMode) return;

    setSavingProject(true);
    setActionMessage('');

    try {
      let uploadedImage = null;
      if (imageFile) {
        const token = await getToken();
        uploadedImage = await uploadProjectImage(imageFile, token);
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        tags: form.tags,
        githubUrl: form.githubUrl.trim(),
        liveUrl: form.liveUrl.trim(),
        order: Number(form.order) || 1,
        published: Boolean(form.published),
      };

      if (uploadedImage) {
        payload.imageUrl = uploadedImage.imageUrl;
        payload.imagePublicId = uploadedImage.imagePublicId;
      }

      if (editingProjectId) {
        const previous = projects.find((item) => item.id === editingProjectId);
        await updateProject(editingProjectId, payload);

        if (uploadedImage && previous?.imagePublicId) {
          const token = await getToken();
          await deleteProjectImage(previous.imagePublicId, token);
        }

        setActionMessage('Project updated');
      } else {
        if (!uploadedImage) {
          throw new Error('Please choose an image file for a new project.');
        }
        await createProject(payload);
        setActionMessage('Project created');
      }

      resetForm();
      await fetchProjects();
    } catch (error) {
      console.error(error);
      setActionMessage(error?.message ?? 'Failed to save project');
    } finally {
      setSavingProject(false);
    }
  };

  const handleDelete = async (project) => {
    if (!isAdmin || !editMode || !project?.id) return;
    if (!window.confirm(`Delete project "${project.title}"?`)) return;

    setActionMessage('');
    try {
      await deleteProject(project.id);
      if (project.imagePublicId) {
        const token = await getToken();
        await deleteProjectImage(project.imagePublicId, token);
      }
      if (editingProjectId === project.id) resetForm();
      setActionMessage('Project deleted');
      await fetchProjects();
    } catch (error) {
      console.error(error);
      setActionMessage(error?.message ?? 'Failed to delete project');
    }
  };

  const handleImageClick = (project) => {
    setSelectedImage(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };
  return (
    <section id="projects" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Featured <span className="text-primary">Projects</span>
        </h2>

        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Here are some of my recent projects that showcase my skills and
          creativity.
        </p>

        {isAdmin && editMode ? (
          <form onSubmit={handleSubmit} className="mb-10 p-5 rounded-lg bg-card text-left">
            <h3 className="text-xl font-semibold mb-4">
              {editingProjectId ? 'Edit Project' : 'Add Project'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Title</label>
                <input
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
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
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Description</label>
                <textarea
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1 min-h-24"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tags</label>
                <div className="flex gap-2 mt-1">
                  <input
                    className="w-full rounded-md bg-secondary/70 px-3 py-2"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Type tag and press Enter"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-secondary/70 text-foreground text-sm"
                    onClick={addTag}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs"
                      onClick={() => removeTag(tag)}
                      title="Remove tag"
                    >
                      {tag} ×
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Image File</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Live URL</label>
                <input
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                  value={form.liveUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, liveUrl: e.target.value }))}
                  placeholder="https://your-app.vercel.app"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">GitHub URL</label>
                <input
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                  value={form.githubUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, githubUrl: e.target.value }))}
                  placeholder="https://github.com/you/repo"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input
                id="project-published"
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
              />
              <label htmlFor="project-published" className="text-sm text-muted-foreground">
                Published
              </label>
            </div>

            <div className="flex gap-3 mt-5">
              <button type="submit" className="button" disabled={savingProject}>
                {savingProject ? 'Saving...' : editingProjectId ? 'Update Project' : 'Create Project'}
              </button>
              {editingProjectId ? (
                <button
                  type="button"
                  className="px-5 py-2 rounded-full bg-secondary/70 text-foreground"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>

            {actionMessage ? (
              <p className="text-sm text-muted-foreground mt-3">{actionMessage}</p>
            ) : null}
          </form>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id ?? project.title}
              className="group bg-card rounded-lg overflow-hidden shadow-xs card-hover"
            >
              <div className="relative cursor-pointer" onClick={() => handleImageClick(project)}>
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-40 object-cover rounded mb-4 transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjYWFhIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-muted-foreground mb-4 text-center">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {toTagList(project.tags).map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-center gap-3">
                  {toSafeUrl(project.liveUrl) ? (
                    <a
                      href={toSafeUrl(project.liveUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium transition-all duration-300 hover:shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                    >
                      Live Demo
                    </a>
                  ) : (
                    <span className="px-4 py-2 rounded-full bg-secondary/70 text-muted-foreground text-sm">
                      No Live Link
                    </span>
                  )}

                  {toSafeUrl(project.githubUrl) ? (
                    <a
                      href={toSafeUrl(project.githubUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-full bg-secondary/70 text-foreground text-sm font-medium transition-colors duration-300 hover:bg-secondary"
                    >
                      GitHub Repo
                    </a>
                  ) : (
                    <span className="px-4 py-2 rounded-full bg-secondary/70 text-muted-foreground text-sm">
                      No Repo Link
                    </span>
                  )}
                </div>

                {isAdmin && editMode ? (
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-full bg-secondary/70 text-foreground text-sm font-medium"
                      onClick={() => beginEdit(project)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-full bg-secondary/70 text-foreground text-sm font-medium"
                      onClick={() => handleDelete(project)}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {loadingProjects ? (
          <p className="text-center text-muted-foreground mt-6">Loading projects...</p>
        ) : null}

        <div className='text-center mt-12'>
            <a
                className='button w-fit flex items-center mx-auto gap-2'
                target='_blank'
              rel='noreferrer'
                href='https://github.com/Jimsj029'
            >
                Check My Github
            </a>
        </div>

        {/* Image Modal */}
        <ImageModal
          isOpen={isModalOpen}
          onClose={closeModal}
          imageSrc={selectedImage?.imageUrl}
          imageAlt={selectedImage?.title}
          projectTitle={selectedImage?.title}
        />
      </div>
    </section>
  );
};
