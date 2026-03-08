import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Testimonial } from "@/components/landing/testimonial";
import { Pricing } from "@/components/landing/pricing";
import { Cta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { ReferralCapture } from "@/components/landing/referral-capture";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <ReferralCapture />
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Cta />
      <Testimonial />
      <Footer />
    </div>
  );
}
