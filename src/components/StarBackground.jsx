import { useEffect, useState } from "react";

export const StarBackground = () => {
  const [stars, setStars] = useState([]);
  const [meteors, setMeteors] = useState([]);

  useEffect(() => {
    generateStars(); 
    generateMeteors();   

    const handleResize = () => {
      generateStars();
      generateMeteors();
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
    
  const generateStars = () => {
    const numberofStars = Math.floor(
      (window.innerWidth * window.innerHeight) / 10000
    );
    const newStars = []

    for (let i = 0; i < numberofStars; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1, 
          opacity: Math.random() * 0.5 + 0.5,
          animationDuration: Math.random() * 4 + 2,
        });
    }
    setStars(newStars);
  };


  const generateMeteors = () => {
    const numberofMeteors = 4;
    const newMeteors = []

    for (let i = 0; i < numberofMeteors; i++) {
        newMeteors.push({
          id: i,
          x: Math.random() * 100,
          y: -10, // Start above the screen
          size: Math.random() * 2 + 1, 
          delay: Math.random() * 10, // Reduced delay range
          animationDuration: Math.random() * 3 + 5, // Longer duration
        });
    }
    setMeteors(newMeteors);
  };

  return <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {stars.map((star) => (
        <div
          key={star.id}
          className="star animate-pulse-subtle"
          style={{
            width: star.size + "px",
            height: star.size + "px",
            left: star.x + "%",
            top: star.y + "%",
            opacity: star.opacity,
            animationDuration: star.animationDuration + "s",
          }}
        />
    ))}

      {meteors.map((meteor) => (
        <div
          key={meteor.id}
          className="meteor animate-meteor"
          style={{
            width: meteor.size * 50 + "px",
            height: meteor.size * 2 + "px",
            left: meteor.x + "%",
            top: meteor.y + "%",
            animationDelay: meteor.delay + "s",
            animationDuration: meteor.animationDuration + "s",
          }}
        />
    ))}
  </div>;
};
