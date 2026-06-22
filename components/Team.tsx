"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { teamMembers } from "./teamData";
import TeamCard from "./TeamCard";

export default function Team() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const total = teamMembers.length;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);

  // Auto-slide every 3 seconds, pause on hover
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const visibleMembers = [0, 1, 2].map((offset) => teamMembers[(index + offset) % total]);

  return (
    <section id="team" className="bg-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
          <div>
            <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-2">
              Our Team
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase leading-tight">
              Train With Expert Coaches
            </h2>
          </div>
          <a
            href="/team"
            className="self-start md:self-end border border-orange-500 text-white hover:bg-orange-500 font-bold tracking-widest uppercase px-8 py-3 transition-colors duration-200 whitespace-nowrap"
          >
            Book Appointment
          </a>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {visibleMembers.map((member, i) => (
            <TeamCard
              key={`${index}-${i}`}
              member={member}
              active={activeCard === i}
              onToggle={() => setActiveCard((prev) => (prev === i ? null : i))}
            />
          ))}
        </div>

        {/* Dots + arrows */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button onClick={prev} className="text-white hover:text-orange-500 transition-colors" aria-label="Previous">
            <ChevronLeft size={22} />
          </button>
          {teamMembers.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1 transition-all duration-300 ${
                i === index ? "w-8 bg-orange-500" : "w-4 bg-zinc-600"
              }`}
              aria-label={`Go to member ${i + 1}`}
            />
          ))}
          <button onClick={next} className="text-white hover:text-orange-500 transition-colors" aria-label="Next">
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}
