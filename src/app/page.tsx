import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { Specs } from "@/components/sections/specs";
import { Problem } from "@/components/sections/problem";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Features } from "@/components/sections/features";
import { YourAI } from "@/components/sections/your-ai";
import { Pricing } from "@/components/sections/pricing";
import { FAQ } from "@/components/sections/faq";
import { FinalCTA } from "@/components/sections/final-cta";
import { Footer } from "@/components/sections/footer";
import { MotionProvider } from "@/components/motion-provider";

export default function Home() {
  return (
    <MotionProvider>
      <Nav />
      <main id="main">
        <Hero />
        <Specs />
        <Problem />
        <HowItWorks />
        <Features />
        <YourAI />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </MotionProvider>
  );
}
