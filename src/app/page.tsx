import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Solution } from "@/components/Solution";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { TechStack } from "@/components/TechStack";
import { CTA } from "@/components/CTA";

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
