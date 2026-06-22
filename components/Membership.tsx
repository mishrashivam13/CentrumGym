"use client";
import { useState } from "react";

const plans = [
  {
    name: "Single Day Pass",
    duration: "ONE-TIME ENTRY",
    features: ["Access to gym floor","Locker & shower","Cardio + strength equipment","Basic trainer guidance","No commitment","Valid for one day"],
  },
  {
    name: "Annual Membership",
    duration: "12 MONTHS",
    features: ["Unlimited gym access","Personalized workout plan","1 Free fitness assessment","Group classes included","Month-to-month flexibility","No time restrictions"],
  },
  {
    name: "Half-Yearly Plan",
    duration: "6 MONTHS",
    features: ["Unlimited gym access","Diet consultation (1 session)","Certified personal trainer support","Weight loss/strength programs","Flexible entry hours","Month-to-month renewal option"],
  },
];

export default function Membership() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (i: number) => setActiveIndex((prev) => (prev === i ? null : i));

  return (
    <section id="services" className="bg-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">Our Plans</p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase">Choose Your Membership Plan</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const on = activeIndex === i;
            return (
              <div
                key={i}
                onClick={() => toggle(i)}
                className={`border p-8 flex flex-col cursor-pointer select-none transition-all duration-500 ${
                  on
                    ? "bg-white border-white -translate-y-2 shadow-2xl shadow-orange-500/30"
                    : "bg-black border-zinc-700 hover:bg-white hover:border-white hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/30"
                }`}
              >
                <h3 className={`text-2xl font-black mb-1 transition-colors duration-500 ${on ? "text-black" : "text-white"}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs font-bold tracking-widest mb-8 transition-colors duration-500 ${on ? "text-gray-500" : "text-gray-400"}`}>
                  {plan.duration}
                </p>
                <ul className="flex flex-col gap-3 mb-10 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`text-sm text-center transition-colors duration-500 ${on ? "text-orange-500" : "text-gray-400"}`}>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  onClick={(e) => e.stopPropagation()}
                  className={`block text-center font-bold tracking-widest uppercase py-4 transition-all duration-500 ${
                    on ? "bg-orange-500 text-white" : "bg-zinc-800 text-white hover:bg-orange-500"
                  }`}
                >
                  Join Now
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
