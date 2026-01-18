"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";

type Props = {
  images: { src: string; alt: string }[];
};

export function HeroCarousel({ images }: Props) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrent(index);
  };

  useEffect(() => {
    if (isPaused) return;
    
    const id = setInterval(goToNext, 5000);
    return () => clearInterval(id);
  }, [isPaused, goToNext]);

  return (
    <div 
      className="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {images.map((img, idx) => (
        <div
          key={img.src}
          className={`carousel__item ${idx === current ? "active" : ""}`}
          aria-hidden={idx !== current}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            style={{ objectFit: "cover" }}
            sizes="100vw"
            priority={idx === 0}
          />
          <div className="carousel__overlay" />
        </div>
      ))}

      <button 
        className="carousel__arrow carousel__arrow--prev"
        onClick={goToPrev}
        aria-label="Slide anterior"
      >
        &#8249;
      </button>
      
      <button 
        className="carousel__arrow carousel__arrow--next"
        onClick={goToNext}
        aria-label="Próximo slide"
      >
        &#8250;
      </button>

      <div className="carousel__dots">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`dot ${idx === current ? "dot--active" : ""}`}
            onClick={() => goToSlide(idx)}
            aria-label={`Ir para slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
