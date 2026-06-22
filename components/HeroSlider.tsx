"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    bg: "https://m.media-amazon.com/images/I/71kmVyFJGIL._AC_UF1000,1000_QL80_.jpg",
    subtitle: "SHAPE YOUR BODY",
    title: (
      <>
        BE <span className="text-orange-500">STRONG</span>
        <br />
        TRAINING HARD
      </>
    ),
  },
  {
    bg: "https://t4.ftcdn.net/jpg/04/98/76/39/360_F_498763970_XD0R6dPtnsdVlLGyIuxqXHezfnc1s1g4.jpg",
    subtitle: "UNLEASH YOUR POWER",
    title: (
      <>
        PUSH <span className="text-orange-500">LIMITS</span>
        <br />
        CONQUER GOALS
      </>
    ),
  },
  {
    bg: "https://manofmany.com/_next/image?url=https%3A%2F%2Fapi.manofmany.com%2Fwp-content%2Fuploads%2F2023%2F09%2FPexels.jpg&w=1200&q=75",
    subtitle: "START YOUR JOURNEY",
    title: (
      <>
        BUILD <span className="text-orange-500">MUSCLE</span>
        <br />
        TRANSFORM LIFE
      </>
    ),
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <section id="home" className="relative h-screen min-h-[600px] overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.bg})` }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/60" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
            <p className="text-sm tracking-[0.3em] text-gray-300 mb-3 font-semibold">
              {slide.subtitle}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight mb-8">
              {slide.title}
            </h1>
            <a
              href="#classes"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold tracking-widest px-7 py-3 sm:px-10 sm:py-4 uppercase transition-colors duration-200 text-sm sm:text-base"
            >
              JOIN NOW
            </a>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-3 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-3 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-colors ${
              i === current ? "bg-orange-500" : "bg-white/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
