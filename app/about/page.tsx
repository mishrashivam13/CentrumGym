import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import AboutFeatures from "@/components/about/AboutFeatures";
import AboutStory from "@/components/about/AboutStory";
import Team from "@/components/Team";
import Branches from "@/components/about/Branches";
import RegistrationCTA from "@/components/about/RegistrationCTA";
import Testimonials from "@/components/about/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Us – Centrum Gym",
  description:
    "Learn about Centrum Gym's story, expert coaches, world-class facilities, and our commitment to your fitness goals.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <PageHero
        title="About Us"
        breadcrumb="About"
        bg="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80"
      />
      <AboutFeatures />
      <AboutStory />
      <Team />
      <Branches />
      <RegistrationCTA />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  );
}
