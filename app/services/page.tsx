import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import ServiceGrid from "@/components/services/ServiceGrid";
import ExerciseCTA from "@/components/services/ExerciseCTA";
import Membership from "@/components/Membership";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Services – Centrum Gym",
  description:
    "Explore all fitness services at Centrum Gym — personal training, group classes, strength programs, nutrition coaching, and more.",
};

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <PageHero
        title="Services"
        breadcrumb="Services"
        bg="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80"
      />
      <ServiceGrid />
      <ExerciseCTA />
      <Membership />
      <Contact />
      <Footer />
    </>
  );
}
