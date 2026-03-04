import React, { useState, useEffect } from 'react';

const base = import.meta.env.BASE_URL;

const images = [
  `${base}images/slideshow/bg-1.jpg`,
  `${base}images/slideshow/bg-2.jpg`,
  `${base}images/slideshow/bg-3.jpg`,
  `${base}images/slideshow/bg-4.jpg`,
];

const BackgroundSlideshow: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000); // Change image every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="background-slideshow">
      {images.map((image, index) => (
        <img
          key={image}
          src={image}
          alt={`Background ${index + 1}`}
          className={index === currentImageIndex ? 'active' : ''}
        />
      ))}
    </div>
  );
};

export default BackgroundSlideshow;
