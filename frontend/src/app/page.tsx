import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import {
  CtaBanner,
  FeaturesSection,
  HowItWorks,
  LiveInsights,
  TechStack,
} from "@/components/landing/sections";
import { SiteFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <FeaturesSection />
        <HowItWorks />
        <LiveInsights />
        <TechStack />
        <CtaBanner />
      </main>
      <SiteFooter />
    </div>
  )
}
