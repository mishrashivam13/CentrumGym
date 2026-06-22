import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { teamMembers } from "@/components/teamData";
import TeamCard from "@/components/TeamCard";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Our Team – Centrum Gym",
  description:
    "Meet the expert coaches and trainers at Centrum Gym — certified professionals dedicated to your fitness success.",
};

export default function TeamPage() {
  return (
    <>
      <Navbar />
      <PageHero
        title="Our Team"
        breadcrumb="Our team"
        bg="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80"
      />

      <section className="bg-black py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
            <div>
              <p className="text-orange-500 text-sm font-bold tracking-[0.3em] uppercase mb-2">
                Our Team
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase leading-tight">
                Train With Experts
              </h2>
            </div>
            <a
              href="#contact"
              className="self-start md:self-end border border-orange-500 text-white hover:bg-orange-500 font-bold tracking-widest uppercase px-8 py-3 transition-colors duration-200 whitespace-nowrap"
            >
              Appointment
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member, i) => (
              <TeamCard key={i} member={member} />
            ))}
          </div>
        </div>
      </section>

      <Contact />
      <Footer />
    </>
  );
}
