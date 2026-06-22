import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import WhyChooseUs from "@/components/WhyChooseUs";
import Classes from "@/components/Classes";
import Stats from "@/components/Stats";
import Services from "@/components/Services";
import CallToAction from "@/components/CallToAction";
import Membership from "@/components/Membership";
import Gallery from "@/components/Gallery";
import Team from "@/components/Team";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSlider />
      <WhyChooseUs />
      <Classes />
      <Stats />
      <Services />
      <CallToAction />
      <Membership />
      <Gallery />
      <Team />
      <Contact />
      <Footer />
    </>
  );
}
