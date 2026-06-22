"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Ankita Sharma",
    quote:
      "The personal attention I received here is unmatched. The atmosphere is friendly, and they really focus on building discipline and health. I've recommended this gym to all my friends.",
    stars: 5,
  },
  {
    name: "Rohit Meena",
    quote:
      "Centrum Gym completely transformed my fitness level in just 3 months. The trainers are knowledgeable and supportive. The equipment is top-notch and always well-maintained.",
    stars: 5,
  },
  {
    name: "Priya Joshi",
    quote:
      "I was a complete beginner and felt intimidated at first, but the team made me feel so welcome. The personalized plan they gave me worked wonders. Highly recommended!",
    stars: 5,
  },
  {
    name: "Suresh Kumar",
    quote:
      "Best gym in Jaipur by far. The nutrition guidance combined with the workout programs gave me visible results faster than I expected. The community here is amazing.",
    stars: 4,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const total = testimonials.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);
  const t = testimonials[current];

  return (
    <section className="bg-black py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">
          Testimonial
        </p>
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase mb-14">
          What Our Clients Say
        </h2>

        <div className="relative flex items-center justify-center gap-6">
          {/* Left arrow */}
          <button
            onClick={prev}
            className="bg-zinc-800 hover:bg-zinc-700 text-white p-3 transition-colors flex-shrink-0"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Card */}
          <div className="flex-1">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-700 mx-auto mb-8">
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" width="48" height="48">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
            </div>

            {/* Quote */}
            <p className="text-gray-300 leading-relaxed text-base mb-8 italic">
              &ldquo;{t.quote}&rdquo;
            </p>

            {/* Name */}
            <p className="text-white font-bold tracking-widest uppercase mb-3">{t.name}</p>

            {/* Stars */}
            <div className="flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 24 24"
                  fill={i < t.stars ? "#f97316" : "#374151"}
                  width="18"
                  height="18"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </div>

          {/* Right arrow */}
          <button
            onClick={next}
            className="bg-zinc-800 hover:bg-zinc-700 text-white p-3 transition-colors flex-shrink-0"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 transition-all duration-300 ${
                i === current ? "w-8 bg-orange-500" : "w-4 bg-zinc-600"
              }`}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
