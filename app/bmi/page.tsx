import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import BmiCalculator from "@/components/bmi/BmiCalculator";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "BMI Calculator – Centrum Gym",
  description: "Calculate your Body Mass Index (BMI) and check your weight status with Centrum Gym's free BMI calculator.",
};

export default function BmiPage() {
  return (
    <>
      <Navbar />
      <PageHero
        title="BMI Calculator"
        breadcrumb="BMI calculator"
        bg="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80"
      />
      <BmiCalculator />
      <Contact />
      <Footer />
    </>
  );
}
