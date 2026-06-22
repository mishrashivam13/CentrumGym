"use client";
import { useState } from "react";
import { Dumbbell, Apple, UserCheck, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const features: { Icon: LucideIcon; title: string; desc: string }[] = [
  { Icon: Dumbbell, title: "Modern Equipment",      desc: "Train with the latest machines and gear designed for optimal performance and safety." },
  { Icon: Apple,    title: "Nutrition Guidance",     desc: "Get customized meal plans and expert advice to fuel your fitness journey effectively." },
  { Icon: UserCheck,title: "Expert Coaching",        desc: "Our certified trainers provide structured workout programs tailored to your goals." },
  { Icon: Heart,    title: "Personalized Approach",  desc: "Every member receives a personalized fitness plan that adapts as you progress." },
];

export default function WhyChooseUs() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (i: number) => setActiveIndex((prev) => (prev === i ? null : i));

  return (
    <section id="about" className="bg-zinc-950 py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">Why Choose Us?</p>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-10 md:mb-16 uppercase">Push Your Limits Forward</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map(({ Icon, title, desc }, i) => {
            const on = activeIndex === i;
            return (
              <div key={i} onClick={() => toggle(i)} className="flex flex-col items-center gap-4 cursor-pointer select-none">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300 ${on ? "bg-orange-500" : "bg-zinc-800 hover:bg-orange-500"}`}>
                  <Icon size={36} className={`transition-colors duration-300 ${on ? "text-white" : "text-orange-500 hover:text-white"}`} />
                </div>
                <h3 className={`font-bold text-lg transition-colors duration-300 ${on ? "text-orange-500" : "text-white hover:text-orange-500"}`}>
                  {title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed text-center">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
