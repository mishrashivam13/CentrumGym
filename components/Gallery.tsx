"use client";
import { useState } from "react";

const images = [
  { src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80", alt: "Gym floor" },
  { src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80", alt: "Cardio machines" },
  { src: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80", alt: "Gym area" },
  { src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", alt: "Weight training" },
  { src: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80", alt: "Group hall" },
  { src: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=80", alt: "Sparring area" },
];

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (i: number) => setActiveIndex((prev) => (prev === i ? null : i));

  return (
    <section id="gallery" className="bg-zinc-950 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">Our Facility</p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase">See the Space</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-[160px] sm:auto-rows-[200px]">
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => toggle(i)}
              className={`overflow-hidden cursor-pointer ${i === 0 ? "col-span-2 row-span-2" : ""}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  activeIndex === i ? "scale-110" : "scale-100 hover:scale-105"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
