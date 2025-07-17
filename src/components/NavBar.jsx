import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { X, Menu } from "lucide-react";

const navItems = [
  { name: "Home", href: "#hero" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
];

export const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed w-full z-50 transition-all duration-300",
        isScrolled ? "py-3 bg-background/80 backdrop-blur-md shadow-xs" : "py-5"
      )}
    >
      <div className="container flex items-center justify-between">
        <a
          className="text-xl font-bold text-primary flex items-center"
          href="#hero"
        >
          <span className="relative z-10">
            <span className="text-glow text-foreground">
              Jimuel A. San Juan
            </span>{" "}
            Portfolio
          </span>
        </a>

        {/* Desk nav */}

        <div className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-foreground/80 hover:text-primary transition-colors duration-300"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* mobile nav */}

        <button onClick={() => setIsMenuOpen((prev) => !prev)} 
        className="md:hidden p-2 text-foreground relative z-[60]">
          {" "}
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}{" "}
        
        </button>

        <div
          className={cn(
            "fixed top-0 left-0 right-0 bottom-0 bg-background/95 backdrop-blur-md z-[60] flex flex-col items-center justify-center",
            "transition-all duration-300 md:hidden",

            isMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          )}
          style={{ height: '100vh', width: '100vw' }}
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="flex flex-col space-y-8 text-xl text-center" onClick={(e) => e.stopPropagation()}>
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground/80 hover:text-primary transition-colors duration-300 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
