"use client";
import { useState } from "react";
import { Dumbbell, Clock, Users, Award, Zap, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const services: { Icon: LucideIcon; title: string; desc: string }[] = [
  { Icon: Dumbbell, title: "Weight Training",   desc: "Build strength and muscle with guided weight training sessions using state-of-the-art equipment." },
  { Icon: Zap,      title: "Cardio Programs",   desc: "High-energy cardio workouts designed to maximize fat burn and boost cardiovascular health." },
  { Icon: Users,    title: "Group Classes",     desc: "Fun and motivating group classes led by expert instructors for all fitness levels." },
  { Icon: Award,    title: "Personal Training", desc: "One-on-one coaching sessions with certified trainers to accelerate your fitness goals." },
  { Icon: Clock,    title: "Flexible Hours",    desc: "Open early and late to fit your busy schedule. Train when it works best for you." },
  { Icon: Shield,   title: "Safe Environment",  desc: "Clean, safe, and welcoming facility with 24/7 security and regular sanitation." },
];

export default function Services() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (i: number) => setActiveIndex((prev) => (prev === i ? null : i));

  return (
    <section id="services" className="bg-zinc-950 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">What We Offer</p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase">Our Services</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(({ Icon, title, desc }, i) => {
            const on = activeIndex === i;
            return (
              <div
                key={i}
                onClick={() => toggle(i)}
                className={`border p-8 cursor-pointer select-none transition-colors duration-300 ${
                  on ? "border-orange-500" : "border-zinc-800 hover:border-orange-500"
                }`}
              >
                <div className={`mb-5 transition-colors duration-300 ${on ? "text-orange-500" : "text-zinc-500"}`}>
                  <Icon size={32} />
                </div>
                <h3 className={`font-bold text-xl mb-3 transition-colors duration-300 ${on ? "text-orange-500" : "text-white"}`}>
                  {title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
