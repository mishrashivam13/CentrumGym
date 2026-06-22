import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact Us – Centrum Gym",
  description: "Get in touch with Centrum Gym. Find our location in Jhotwara, Jaipur and reach out for memberships, queries, or fitness consultations.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <PageHero
        title="Contact Us"
        breadcrumb="Contact us"
        bg="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80"
      />
      <Contact />
      <Footer />
    </>
  );
}
