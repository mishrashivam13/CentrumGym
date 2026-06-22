import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import TimetableSection from "@/components/timetable/TimetableSection";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Classes Timetable – Centrum Gym",
  description: "Find the perfect class time at Centrum Gym. View our weekly schedule for all fitness classes.",
};

export default function TimetablePage() {
  return (
    <>
      <Navbar />
      <PageHero
        title="Timetable"
        breadcrumb="Timetable"
        bg="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80"
      />
      <TimetableSection />
      <Contact />
      <Footer />
    </>
  );
}
