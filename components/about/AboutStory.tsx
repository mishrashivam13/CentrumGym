"use client";
import { useEffect, useRef, useState } from "react";

const skills = [
  { label: "Strength & Conditioning", pct: 90 },
  { label: "Personal Training", pct: 95 },
  { label: "Overall Wellness", pct: 85 },
];

function SkillBar({ label, pct }: { label: string; pct: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          setTimeout(() => setWidth(pct), 200);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [pct]);

  return (
    <div ref={ref} className="mb-6">
      <div className="flex justify-between text-sm text-white mb-2">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 bg-zinc-700 w-full">
        <div
          className="h-1 bg-white transition-all duration-1000 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function AboutStory() {
  return (
    <section className="bg-black py-20 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <div className="overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80"
            alt="Fitness journey"
            className="w-full h-64 sm:h-80 lg:h-[480px] object-cover object-top hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div>
          <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">
            About Us
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase leading-tight mb-6">
            Empowering Your Fitness Journey
          </h2>
          <p className="text-gray-400 leading-relaxed mb-10">
            At our fitness center, we combine cutting-edge training methods, expert coaching, and a
            supportive environment to help you achieve your goals. Whether you&apos;re a beginner or an
            experienced athlete, we&apos;re here to push your limits and celebrate your progress.
          </p>

          {skills.map((s) => (
            <SkillBar key={s.label} label={s.label} pct={s.pct} />
          ))}
        </div>
      </div>
    </section>
  );
}
