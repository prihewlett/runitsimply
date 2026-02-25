import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Industries } from "@/components/landing/industries";
import { Testimonial } from "@/components/landing/testimonial";
import { Pricing } from "@/components/landing/pricing";
import { Cta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Industries />
      <Testimonial />
      <Pricing />
      <Cta />
      <Footer />
    </div>
  );
}
