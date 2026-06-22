import { Dumbbell, Clock, Users, Award, Zap, Shield } from "lucide-react";

const services = [
  {
    icon: <Dumbbell size={32} />,
    title: "Weight Training",
    desc: "Build strength and muscle with guided weight training sessions using state-of-the-art equipment.",
  },
  {
    icon: <Zap size={32} />,
    title: "Cardio Programs",
    desc: "High-energy cardio workouts designed to maximize fat burn and boost cardiovascular health.",
  },
  {
    icon: <Users size={32} />,
    title: "Group Classes",
    desc: "Fun and motivating group classes led by expert instructors for all fitness levels.",
  },
  {
    icon: <Award size={32} />,
    title: "Personal Training",
    desc: "One-on-one coaching sessions with certified trainers to accelerate your fitness goals.",
  },
  {
    icon: <Clock size={32} />,
    title: "Flexible Hours",
    desc: "Open early and late to fit your busy schedule. Train when it works best for you.",
  },
  {
    icon: <Shield size={32} />,
    title: "Safe Environment",
    desc: "Clean, safe, and welcoming facility with 24/7 security and regular sanitation.",
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-zinc-950 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">
            What We Offer
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase">
            Our Services
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div
              key={i}
              className="border border-zinc-800 p-8 hover:border-orange-500 group transition-colors duration-300"
            >
              <div className="text-zinc-500 group-hover:text-orange-500 mb-5 transition-colors">
                {s.icon}
              </div>
              <h3 className="text-white font-bold text-xl mb-3">{s.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
