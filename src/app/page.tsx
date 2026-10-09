import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Specs } from "@/components/sections/specs";
import { Features } from "@/components/sections/features";
import { YourAI } from "@/components/sections/your-ai";
import { FAQ } from "@/components/sections/faq";
import { FinalCTA } from "@/components/sections/final-cta";
import { Footer } from "@/components/sections/footer";
import { MotionProvider } from "@/components/motion-provider";

/*
 * Section order puts the positioning first: what it does and how you pay (hero), the choice
 * creators face today (problem), the product in action (how it works), the output at a glance
 * (specs) and the feature tour (what's inside). Your AI and your bill comes next, ending on
 * "How you pay" and its wishlist link, so the pay-once story sits right before the objections
 * (FAQ) and the ask (wishlist).
 */
export default function Home() {
  return (
    <MotionProvider>
      <Nav />
      <main id="main">
        <Hero />
        <Problem />
        <HowItWorks />
        <Specs />
        <Features />
        <YourAI />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </MotionProvider>
  );
}
