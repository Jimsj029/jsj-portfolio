import React, { useEffect, useState } from 'react';
import { ImageModal } from '../ImageModal';
import { listProjects } from '@/lib/contentApi';

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState(fallbackProjects);

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

  useEffect(() => {
    let cancelled = false;
    listProjects({ publishedOnly: true })
      .then((items) => {
        if (cancelled) return;
        if (Array.isArray(items) && items.length > 0) setProjects(items);
      })
      .catch((err) => {
        console.error("Failed to load Firestore projects:", err);
        // Keep fallbackProjects on error
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
              </div>
            </div>
          ))}
        </div>

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
