import Link from "next/link";
import { ChevronRight } from "lucide-react";

const classes = [
  {
    img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
    tag: "STRENGTH TRAINING",
    title: "WEIGHT TRAINING",
    slug: "weight-training",
  },
  {
    img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
    tag: "FAT BURN",
    title: "HIGH-INTENSITY TRAINING",
    slug: "hiit",
  },
  {
    img: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=600&q=80",
    tag: "CORE FOCUS",
    title: "FUNCTIONAL TRAINING",
    slug: "functional-training",
  },
  {
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
    tag: "CARDIO",
    title: "CARDIO & ENDURANCE",
    slug: "cardio",
  },
  {
    img: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=80",
    tag: "COMBAT",
    title: "BOXING & COMBAT SKILLS",
    slug: "boxing",
  },
];

export default function Classes() {
  return (
    <section id="classes" className="bg-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">
            Our Classes
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase">
            Find Your Perfect Workout
          </h2>
        </div>

        {/* Top row – 3 equal cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {classes.slice(0, 3).map((cls, i) => (
            <ClassCard key={i} cls={cls} />
          ))}
        </div>

        {/* Bottom row – 2 wide cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.slice(3).map((cls, i) => (
            <ClassCard key={i} cls={cls} tall />
          ))}
        </div>

        {/* View all */}
        <div className="text-center mt-10">
          <Link
            href="/classes"
            className="inline-block border border-orange-500 text-white hover:bg-orange-500 font-bold tracking-widest uppercase px-10 py-4 transition-colors duration-200"
          >
            View All Classes
          </Link>
        </div>
      </div>
    </section>
  );
}

function ClassCard({ cls, tall }: { cls: (typeof classes)[0]; tall?: boolean }) {
  return (
    <Link
      href={`/classes/${cls.slug}`}
      className={`relative overflow-hidden group block ${tall ? "h-64" : "h-56"}`}
    >
      <img
        src={cls.img}
        alt={cls.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-orange-900/60 transition-all duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
        <div>
          <p className="text-orange-500 text-xs font-bold tracking-widest mb-1">{cls.tag}</p>
          <h3 className="text-white font-black text-lg leading-tight group-hover:text-orange-400 transition-colors duration-300">
            {cls.title}
          </h3>
        </div>
        <div className="bg-zinc-800/80 group-hover:bg-orange-500 p-2 transition-colors duration-300">
          <ChevronRight size={20} className="text-white" />
        </div>
      </div>
    </Link>
  );
}
