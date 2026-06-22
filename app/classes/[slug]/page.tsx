import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { gymClasses, latestPosts } from "@/components/classes/classesData";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return gymClasses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cls = gymClasses.find((c) => c.slug === slug);
  if (!cls) return {};
  return {
    title: `${cls.name} – Centrum Gym`,
    description: cls.shortDesc,
  };
}

const timetableSlots = [
  { time: "6.00am – 8.00am",   row: ["WEIGHT TRAINING", "CARDIO",      "YOGA",              "FUNCTIONAL TRAINING", null,            "BOXING",              "BODY BUILDING"] },
  { time: "10.00am – 12.00pm", row: [null,               "ZUMBA",       "WEIGHT TRAINING",   "HIIT",                "BODY BUILDING", "FUNCTIONAL TRAINING", null] },
  { time: "5.00pm – 7.00pm",   row: ["BOXING",           "HIIT",        "BODY BUILDING",     null,                  "YOGA",          "CARDIO",              "ZUMBA"] },
  { time: "7.00pm – 9.00pm",   row: ["HIIT",             null,          "BOXING",            "YOGA",                "ZUMBA",         "FUNCTIONAL TRAINING", "WEIGHT TRAINING"] },
];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function ClassDetailPage({ params }: Props) {
  const { slug } = await params;
  const cls = gymClasses.find((c) => c.slug === slug);
  if (!cls) notFound();

  const categories = gymClasses.map((c) => ({ name: c.name, slug: c.slug }));
  const classNameUpper = cls.name.toUpperCase();

  return (
    <>
      <Navbar />

      {/* Hero */}
      <div className="relative h-80 w-full">
        <Image
          src={cls.image}
          alt={cls.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-3">
            Classes Detail
          </h1>
          <p className="text-sm text-gray-300">
            <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/classes" className="hover:text-orange-500 transition-colors">Classes</Link>
            <span className="mx-2">›</span>
            <span className="text-orange-500">{cls.name}</span>
          </p>
        </div>
      </div>

      {/* Main content */}
      <section className="bg-zinc-950 py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left – Detail */}
          <div className="lg:col-span-2">
            <div className="relative w-full h-96 mb-8 overflow-hidden">
              <Image src={cls.image} alt={cls.name} fill className="object-cover" />
            </div>

            <h2 className="text-3xl font-black text-white uppercase mb-4">{cls.name}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">{cls.description}</p>

            <h3 className="text-2xl font-black text-white uppercase mb-4">Trainer</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-10">{cls.trainerDesc}</p>

            {/* Info badges */}
            <div className="flex flex-wrap gap-4 mb-12">
              {[
                { label: "Duration", value: cls.duration },
                { label: "Level",    value: cls.level },
                { label: "Trainer",  value: cls.trainer },
              ].map((item) => (
                <div key={item.label} className="border border-zinc-700 px-5 py-3 bg-black">
                  <p className="text-orange-500 text-xs font-bold tracking-widest uppercase mb-1">{item.label}</p>
                  <p className="text-white font-bold text-sm">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Mini timetable */}
            <h3 className="text-xl font-black text-white uppercase mb-5">Classes Timetable</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs min-w-[500px]">
                <thead>
                  <tr>
                    <th className="bg-orange-500 border border-zinc-700 py-3 px-2 w-28" />
                    {days.map((d) => (
                      <th key={d} className="bg-orange-500 text-white font-bold py-3 px-2 text-center border border-zinc-700">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timetableSlots.map(({ time, row }) => (
                    <tr key={time}>
                      <td className="bg-black border border-zinc-700 px-2 py-4 text-center text-orange-500 font-semibold text-xs">
                        {time}
                      </td>
                      {row.map((cell, ci) => (
                        <td key={ci} className="bg-black border border-zinc-700 text-center px-1 py-4 relative">
                          {cell ? (
                            <span className={`font-bold text-xs ${cell === classNameUpper ? "text-orange-500" : "text-gray-500"}`}>
                              {cell}
                            </span>
                          ) : (
                            <div className="absolute inset-0 overflow-hidden opacity-20">
                              <svg width="100%" height="100%">
                                <line x1="0" y1="0" x2="100%" y2="100%" stroke="white" strokeWidth="1" />
                              </svg>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right – Sidebar */}
          <div className="flex flex-col gap-10">

            {/* Categories */}
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-base mb-5 pb-3 border-b border-zinc-700">
                Categories
              </h4>
              <ul className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/classes/${cat.slug}`}
                      className={`block py-2 text-sm transition-colors ${
                        cat.slug === slug
                          ? "text-orange-500 font-bold"
                          : "text-gray-400 hover:text-orange-500"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Latest Posts */}
            <div>
              <h4 className="text-white font-black uppercase tracking-widest text-base mb-5 pb-3 border-b border-zinc-700">
                Latest Posts
              </h4>
              <div className="flex flex-col gap-5">
                {latestPosts.map((post, i) => (
                  <div key={i} className={i === 0 ? "" : "flex gap-3 items-start"}>
                    {i === 0 ? (
                      <div className="relative w-full h-44 mb-3 overflow-hidden">
                        <Image src={post.image} alt={post.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-4">
                          <p className="text-white font-bold text-sm leading-snug">{post.title}</p>
                          <p className="text-gray-400 text-xs mt-1">{post.date}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden">
                          <Image src={post.image} alt={post.title} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="text-white text-xs font-semibold leading-snug mb-1">{post.title}</p>
                          <p className="text-gray-500 text-xs">{post.date}</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      <Contact />
      <Footer />
    </>
  );
}
