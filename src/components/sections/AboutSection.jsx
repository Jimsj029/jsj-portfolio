import { Code } from "lucide-react";
import { User } from "lucide-react";
import { Briefcase } from "lucide-react";

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-4 relative">
      {""}
      <div className="contianer mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          About <span className="text-primary"> Me</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">
              I am a passionate web developer with hands-on experience in
              building responsive and user-friendly web applications using
              MERN stack.
            </h3>

            <p className="text-muted-foreground">
              During my internship at Bulacan State University's Planning and
              Development Office, I contributed to frontend development and
              debugging tasks, gaining valuable exposure to real-world web
              development workflows and industry standards.
            </p>

            <p className="text-muted-foreground">
              I enjoy creating clean and functional designs, and I'm
              particularly interested in improving user experiences through
              responsive layouts and interactive features. Always eager to
              learn, I continuously explore modern tools and frameworks to grow
              my skills and contribute meaningfully to every project I join.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <a href="#contact" className="button">
                Get In Touch
              </a>

              <a
                href="/cv/Jimuel_Sanjuan_CV.pdf"
                download="Jimuel_Sanjuan_CV.pdf"
                className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/10  transition-colors-duration-300"
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
