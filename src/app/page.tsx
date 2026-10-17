import { Hero } from "@/components/landing-page/Hero";
import { Problem } from "@/components/landing-page/Problem";
import { Solution } from "@/components/landing-page/Solution";
import { Features } from "@/components/landing-page/Features";
import { HowItWorks } from "@/components/landing-page/HowItWorks";
import { TechStack } from "@/components/landing-page/TechStack";
import { CTA } from "@/components/landing-page/CTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent transition-colors duration-200">
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <HowItWorks />
      <TechStack />
      <CTA />
    </div>
  );
}
