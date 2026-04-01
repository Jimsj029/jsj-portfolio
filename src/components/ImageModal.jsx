import React, { useEffect, useState } from 'react';

export const ImageModal = ({ isOpen, onClose, imageSrc, imageUrls = [], initialIndex = 0, imageAlt }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [stars, setStars] = useState([]);
  const [meteors, setMeteors] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const normalizedImages = Array.isArray(imageUrls) && imageUrls.length > 0
    ? imageUrls.filter(Boolean)
    : imageSrc
    ? [imageSrc]
    : [];
  const activeImage = normalizedImages[activeIndex] || imageSrc;
  const hasMultipleImages = normalizedImages.length > 1;

  // Generate stars and meteors for modal background
  const generateStars = () => {
    const numberofStars = Math.floor(
      (window.innerWidth * window.innerHeight) / 15000
    );
    const newStars = []

    for (let i = 0; i < numberofStars; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1, 
          opacity: Math.random() * 0.3 + 0.2,
          animationDuration: Math.random() * 4 + 2,
        });
    }
    setStars(newStars);
  };

  const generateMeteors = () => {
    const numberofMeteors = 3;
    const newMeteors = []

    for (let i = 0; i < numberofMeteors; i++) {
        newMeteors.push({
          id: i,
          x: Math.random() * 100,
          y: -10,
          size: Math.random() * 1.5 + 0.5, 
          delay: Math.random() * 10,
          animationDuration: Math.random() * 3 + 5,
        });
    }
    setMeteors(newMeteors);
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && hasMultipleImages) {
        setActiveIndex((prev) => (prev + 1) % normalizedImages.length);
      } else if (e.key === 'ArrowLeft' && hasMultipleImages) {
        setActiveIndex((prev) => (prev - 1 + normalizedImages.length) % normalizedImages.length);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      generateStars();
      generateMeteors();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, hasMultipleImages, normalizedImages.length]);

  // Reset image states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setImageLoaded(false);
      setImageError(false);
      if (normalizedImages.length > 0) {
        const safeIndex = Math.min(Math.max(initialIndex, 0), normalizedImages.length - 1);
        setActiveIndex(safeIndex);
      } else {
        setActiveIndex(0);
      }
    }
  }, [isOpen, imageSrc, initialIndex, imageUrls, normalizedImages.length]);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      onClick={onClose}
    >
      {/* Star and Meteor Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
      </div>
      <div className="relative w-[min(92vw,1200px)] h-[min(82vh,760px)] m-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 md:-top-12 md:right-0 -top-8 right-2 text-white hover:text-gray-300 transition-colors duration-200 z-10 bg-black bg-opacity-50 rounded-full p-2 md:bg-transparent md:p-0"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6 md:w-8 md:h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev - 1 + normalizedImages.length) % normalizedImages.length);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 px-3 py-2 rounded-full bg-black/60 text-white"
              aria-label="Previous image"
            >
              {'<'}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev + 1) % normalizedImages.length);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 px-3 py-2 rounded-full bg-black/60 text-white"
              aria-label="Next image"
            >
              {'>'}
            </button>
          </>
        ) : null}

        {/* Image container */}
        <div
          className="relative h-full w-full bg-black/30 rounded-lg shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Loading spinner */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Error state */}
          {imageError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 text-gray-200">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>Image could not be loaded</p>
              <p className="text-sm mt-1">Path: {activeImage}</p>
            </div>
          )}

          {/* Image */}
          <img
            src={activeImage}
            alt={imageAlt}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{ display: imageError ? 'none' : 'block' }}
          />

          {hasMultipleImages ? (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-xs">
              {activeIndex + 1} / {normalizedImages.length}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
