import React, { useState } from 'react';
import { ImageModal } from '../ImageModal';

const projects = [
  {
    id: 1,
    title: "Basic Email Sender",
    description: "A simple email sender application",
    image: "/projects/emailsender.png",
    tags: ["React", "Node.js", "Nodemailer", "HTML/CSS"],
  },
  {
    id: 2,
    title: "Basic Email Template Builder",
    description: "A simple email template builder application",
    image: "/projects/emailtemplatebuilder.png",
    tags: ["React", "Node.js", "Nodemailer", "HTML/CSS", "Quill.js"],
  },
  {
    id: 3,
    title: "Basic Login System",
    description: "A simple login system application",
    image: "/projects/login.png",
    tags: ["Laravel", "HTML/CSS", "PHP", "MySQL"],
  },
];

export const ProjectsSection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          {projects.map((project, key) => (
            <div
              key={key}
              className="group bg-card rounded-lg overflow-hidden shadow-xs card-hover"
            >
              <div className="relative cursor-pointer" onClick={() => handleImageClick(project)}>
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-40 object-cover rounded mb-4 transition-transform duration-300 group-hover:scale-105"
                  onLoad={() => console.log(`Image loaded: ${project.image}`)}
                  onError={(e) => {
                    console.log(`Image failed to load: ${project.image}`);
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjYWFhIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4 text-center">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {project.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-primary text-white px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='text-center mt-12'>
            <a
                className='button w-fit flex items-center mx-auto gap-2'
                target='_blank'
                href='https://github.com/Jimsj029'
            >
                Check My Github
            </a>
        </div>

        {/* Image Modal */}
        <ImageModal
          isOpen={isModalOpen}
          onClose={closeModal}
          imageSrc={selectedImage?.image}
          imageAlt={selectedImage?.title}
          projectTitle={selectedImage?.title}
        />
      </div>
    </section>
  );
};
