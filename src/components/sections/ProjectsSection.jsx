import React, { useCallback, useEffect, useRef, useState } from 'react';
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
    imageUrls: ["/projects/emailsender.png"],
    tags: ["React", "Node.js", "Nodemailer", "HTML/CSS"],
    order: 1,
    published: true,
  },
  {
    id: 2,
    title: "Basic Email Template Builder",
    description: "A simple email template builder application",
    imageUrl: "/projects/emailtemplatebuilder.png",
    imageUrls: ["/projects/emailtemplatebuilder.png"],
    tags: ["React", "Node.js", "Nodemailer", "HTML/CSS", "Quill.js"],
    order: 2,
    published: true,
  },
  {
    id: 3,
    title: "Basic Login System",
    description: "A simple login system application",
    imageUrl: "/projects/login.png",
    imageUrls: ["/projects/login.png"],
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
  const [activeImageByProject, setActiveImageByProject] = useState({});
  const dragStateRef = useRef({});
  const suppressClickRef = useRef({});

  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: [],
    githubUrl: '',
    liveUrl: '',
    order: 1,
    published: true,
    existingImageUrls: [],
    existingImagePublicIds: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
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

  const projectKey = (project) => String(project?.id ?? project?.title ?? 'project');

  const getProjectImages = (project) => {
    const fromArray = Array.isArray(project?.imageUrls)
      ? project.imageUrls.filter(Boolean)
      : [];
    if (fromArray.length > 0) return fromArray;
    if (project?.imageUrl) return [project.imageUrl];
    return [];
  };

  const getProjectImagePublicIds = (project) => {
    const fromArray = Array.isArray(project?.imagePublicIds)
      ? project.imagePublicIds.filter(Boolean)
      : [];
    if (fromArray.length > 0) return fromArray;
    if (project?.imagePublicId) return [project.imagePublicId];
    return [];
  };

  const setNextImage = (project, direction) => {
    const images = getProjectImages(project);
    if (images.length <= 1) return;

    const key = projectKey(project);
    setActiveImageByProject((prev) => {
      const current = Number.isFinite(prev[key]) ? prev[key] : 0;
      const nextIndex = (current + direction + images.length) % images.length;
      return { ...prev, [key]: nextIndex };
    });
  };

  const handleCarouselPointerDown = (project, event) => {
    const key = projectKey(project);
    dragStateRef.current[key] = {
      startX: event.clientX,
      moved: false,
      pointerId: event.pointerId,
    };
  };

  const handleCarouselPointerMove = (project, event) => {
    const key = projectKey(project);
    const state = dragStateRef.current[key];
    if (!state) return;
    if (typeof state.pointerId === 'number' && state.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - state.startX;
    if (Math.abs(deltaX) > 8) {
      state.moved = true;
    }
  };

  const handleCarouselPointerUp = (project, event) => {
    const key = projectKey(project);
    const state = dragStateRef.current[key];
    if (!state) return;
    if (typeof state.pointerId === 'number' && state.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - state.startX;
    if (Math.abs(deltaX) > 8) {
      suppressClickRef.current[key] = true;
    }

    if (Math.abs(deltaX) >= 35) {
      if (deltaX < 0) {
        setNextImage(project, 1);
      } else {
        setNextImage(project, -1);
      }
    }

    delete dragStateRef.current[key];
  };

  const handleCarouselPointerCancel = (project) => {
    const key = projectKey(project);
    delete dragStateRef.current[key];
  };

  const handleCarouselClick = (project) => {
    const key = projectKey(project);
    if (suppressClickRef.current[key]) {
      suppressClickRef.current[key] = false;
      return;
    }

    const images = getProjectImages(project);
    const activeIndex = Number.isFinite(activeImageByProject[key])
      ? activeImageByProject[key]
      : 0;
    handleImageClick(project, images[activeIndex] || images[0]);
  };

  const fetchProjects = useCallback(async () => {
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
  }, [isAdmin, editMode]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveImageByProject((prev) => {
        const next = { ...prev };
        projects.forEach((project) => {
          const images = getProjectImages(project);
          if (images.length <= 1) {
            next[projectKey(project)] = 0;
            return;
          }
          const current = Number.isFinite(next[projectKey(project)])
            ? next[projectKey(project)]
            : 0;
          next[projectKey(project)] = (current + 1) % images.length;
        });
        return next;
      });
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [projects]);

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      tags: [],
      githubUrl: '',
      liveUrl: '',
      order: projects.length + 1,
      published: true,
      existingImageUrls: [],
      existingImagePublicIds: [],
    });
    setTagInput('');
    setImageFiles([]);
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
      existingImageUrls: getProjectImages(project),
      existingImagePublicIds: getProjectImagePublicIds(project),
    });
    setTagInput('');
    setImageFiles([]);
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

  const removeExistingImage = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      existingImageUrls: prev.existingImageUrls.filter((_, index) => index !== indexToRemove),
      existingImagePublicIds: prev.existingImagePublicIds.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAdmin || !editMode) return;

    setSavingProject(true);
    setActionMessage('');

    try {
      let uploadedImages = [];
      if (imageFiles.length > 0) {
        const token = await getToken();
        for (const file of imageFiles) {
          const uploaded = await uploadProjectImage(file, token);
          uploadedImages.push(uploaded);
        }
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

      const keptImageUrls = Array.isArray(form.existingImageUrls) ? form.existingImageUrls : [];
      const keptImagePublicIds = Array.isArray(form.existingImagePublicIds)
        ? form.existingImagePublicIds
        : [];
      const uploadedImageUrls = uploadedImages.map((item) => item.imageUrl);
      const uploadedImagePublicIds = uploadedImages.map((item) => item.imagePublicId);

      payload.imageUrls = [...keptImageUrls, ...uploadedImageUrls];
      payload.imagePublicIds = [...keptImagePublicIds, ...uploadedImagePublicIds];

      if (payload.imageUrls.length > 0) {
        // Keep single-image fields for backward compatibility.
        payload.imageUrl = payload.imageUrls[0];
        payload.imagePublicId = payload.imagePublicIds[0];
      } else {
        payload.imageUrl = '';
        payload.imagePublicId = '';
      }

      if (editingProjectId) {
        const previous = projects.find((item) => item.id === editingProjectId);
        await updateProject(editingProjectId, payload);

        const previousPublicIds = getProjectImagePublicIds(previous);
        const nextPublicIds = payload.imagePublicIds;
        const removedPublicIds = previousPublicIds.filter(
          (publicId) => !nextPublicIds.includes(publicId)
        );

        if (removedPublicIds.length > 0) {
          const token = await getToken();
          await Promise.all(removedPublicIds.map((publicId) => deleteProjectImage(publicId, token)));
        }

        setActionMessage('Project updated');
      } else {
        if (payload.imageUrls.length === 0) {
          throw new Error('Please choose at least one image file for a new project.');
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
      const publicIds = getProjectImagePublicIds(project);
      if (publicIds.length > 0) {
          const token = await getToken();
          await Promise.all(publicIds.map((publicId) => deleteProjectImage(publicId, token)));
        }
      if (editingProjectId === project.id) resetForm();
      setActionMessage('Project deleted');
      await fetchProjects();
    } catch (error) {
      console.error(error);
      setActionMessage(error?.message ?? 'Failed to delete project');
    }
  };

  const handleImageClick = (project, imageUrl) => {
    const images = getProjectImages(project);
    const selectedIndex = images.findIndex((img) => img === imageUrl);
    setSelectedImage({
      title: project?.title,
      imageUrl: imageUrl || images[0],
      imageUrls: images,
      initialIndex: selectedIndex >= 0 ? selectedIndex : 0,
    });
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
                <label className="text-sm text-muted-foreground">Project Images</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="w-full rounded-md bg-secondary/70 px-3 py-2 mt-1"
                  onChange={(e) => setImageFiles(Array.from(e.target.files ?? []))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {imageFiles.length > 0
                    ? `${imageFiles.length} image(s) selected`
                    : editingProjectId
                    ? 'Select files only if you want to replace existing images.'
                    : 'Choose one or more images.'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tip: Use Ctrl or Shift while selecting to pick multiple files.
                </p>

                {form.existingImageUrls.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Existing images: {form.existingImageUrls.length}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {form.existingImageUrls.map((imgUrl, idx) => (
                        <div key={`${imgUrl}-${idx}`} className="relative rounded overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={`Project image ${idx + 1}`}
                            className="h-20 w-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 px-2 py-0.5 rounded bg-black/60 text-white text-xs"
                            onClick={() => removeExistingImage(idx)}
                            aria-label={`Remove image ${idx + 1}`}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
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
              <div className="relative mb-4">
                <div
                  className="relative overflow-hidden rounded cursor-pointer touch-pan-y"
                  onClick={() => handleCarouselClick(project)}
                  onPointerDown={(event) => handleCarouselPointerDown(project, event)}
                  onPointerMove={(event) => handleCarouselPointerMove(project, event)}
                  onPointerUp={(event) => handleCarouselPointerUp(project, event)}
                  onPointerCancel={() => handleCarouselPointerCancel(project)}
                  onPointerLeave={(event) => handleCarouselPointerUp(project, event)}
                >
                  <div
                    className="flex w-full will-change-transform [backface-visibility:hidden] transition-transform duration-500 ease-out"
                    style={{
                      transform: `translateX(-${(Number.isFinite(activeImageByProject[projectKey(project)]) ? activeImageByProject[projectKey(project)] : 0) * 100}%)`,
                    }}
                  >
                    {getProjectImages(project).map((imageUrl, idx) => (
                      <div key={`${projectKey(project)}-image-${idx}`} className="relative w-full shrink-0 basis-full aspect-[16/10] bg-secondary/40">
                        <img
                          src={imageUrl}
                          alt={`${project.title} screenshot ${idx + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                          draggable={false}
                          onDragStart={(event) => event.preventDefault()}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjYWFhIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                            e.target.onerror = null;
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {getProjectImages(project).length > 1 ? (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 px-2 py-1 rounded-full bg-black/45 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNextImage(project, -1);
                      }}
                    >
                      {'<'}
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 px-2 py-1 rounded-full bg-black/45 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNextImage(project, 1);
                      }}
                    >
                      {'>'}
                    </button>

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                      {getProjectImages(project).map((_, idx) => (
                        <button
                          key={`${projectKey(project)}-dot-${idx}`}
                          type="button"
                          aria-label={`Go to image ${idx + 1}`}
                          className={`h-2 w-2 rounded-full ${idx === (Number.isFinite(activeImageByProject[projectKey(project)]) ? activeImageByProject[projectKey(project)] : 0) ? 'bg-white' : 'bg-white/50'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageByProject((prev) => ({
                              ...prev,
                              [projectKey(project)]: idx,
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </>
                ) : null}
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
          imageUrls={selectedImage?.imageUrls}
          initialIndex={selectedImage?.initialIndex ?? 0}
          imageAlt={selectedImage?.title}
          projectTitle={selectedImage?.title}
        />
      </div>
    </section>
  );
};
