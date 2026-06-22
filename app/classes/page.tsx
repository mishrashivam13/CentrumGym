import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { gymClasses } from "@/components/classes/classesData";

export const metadata: Metadata = {
  title: "Classes – Centrum Gym",
  description: "Explore all fitness classes at Centrum Gym — Body Building, Cardio, Yoga, HIIT, Zumba, Boxing and more.",
};

export default function ClassesPage() {
  return (
    <>
      <Navbar />
      <PageHero
        title="Our Classes"
        breadcrumb="Classes"
        bg="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80"
      />

      <section className="bg-zinc-950 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-3">
              What We Offer
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase">
              Choose Your Class
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gymClasses.map((cls) => (
              <Link
                key={cls.slug}
                href={`/classes/${cls.slug}`}
                className="group block relative overflow-hidden bg-zinc-900 border border-zinc-700 hover:border-orange-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/20"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={cls.image}
                    alt={cls.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">
                      {cls.duration}
                    </span>
                    <span className="text-gray-500 text-xs">{cls.level}</span>
                  </div>
                  <h3 className="text-white font-black text-lg uppercase mb-2 group-hover:text-orange-500 transition-colors duration-300">
                    {cls.name}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                    {cls.shortDesc}
                  </p>
                  <div className="mt-4 text-orange-500 text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                    Read More
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Contact />
      <Footer />
    </>
  );
}
