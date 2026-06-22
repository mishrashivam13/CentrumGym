import { Dumbbell, Apple, UserCheck, Target } from "lucide-react";

const features = [
  {
    Icon: Dumbbell,
    title: "State-of-the-Art Equipment",
    desc: "Train with the latest, top-quality machines designed for peak performance and safety.",
  },
  {
    Icon: Apple,
    title: "Personalized Nutrition Plans",
    desc: "Fuel your progress with expert-crafted meal plans tailored to your fitness goals.",
  },
  {
    Icon: UserCheck,
    title: "Certified Trainers",
    desc: "Work with professional coaches who design effective, personalized workout plans for every level.",
  },
  {
    Icon: Target,
    title: "Goal-Focused Approach",
    desc: "Whether it's fat loss, muscle gain, or improved endurance — your program fits your journey.",
  },
];

export default function AboutFeatures() {
  return (
    <section className="bg-zinc-950 py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">
          Why Choose Us?
        </p>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-16 uppercase">
          Achieve More With The Right Support
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map(({ Icon, title, desc }, i) => (
            <div key={i} className="flex flex-col items-center gap-4 group">
              <div className="w-20 h-20 rounded-full bg-zinc-800 group-hover:bg-orange-500 flex items-center justify-center transition-colors duration-300">
                <Icon
                  size={36}
                  className="text-orange-500 group-hover:text-white transition-colors duration-300"
                />
              </div>
              <h3 className="text-white font-bold text-lg group-hover:text-orange-500 transition-colors duration-300">
                {title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed text-center">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
