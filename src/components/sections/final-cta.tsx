import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Mascot } from "@/components/brand/mascot";
import { site } from "@/lib/site";

export function FinalCTA() {
  return (
    <section aria-labelledby="final-title" className="pb-24 sm:pb-32">
      <Container>
        <div className="grain relative overflow-hidden rounded-[32px] bg-rose px-6 py-14 sm:px-12 sm:py-16 lg:px-16">
          <div aria-hidden="true" className="perf-rail absolute inset-x-0 top-4 h-3 text-maroon/10" />
          <div aria-hidden="true" className="perf-rail absolute inset-x-0 bottom-4 h-3 text-maroon/10" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-14">
            <Mascot
              pose="welcome"
              fluid
              className="mx-auto h-auto w-[180px] sm:w-[220px] lg:w-[300px]"
            />
            <div className="text-center lg:text-left">
              <h2
                id="final-title"
                className="font-display text-[clamp(2.3rem,5.4vw,4.4rem)] font-extrabold leading-[0.95] tracking-[-0.04em]"
              >
                Your next short is <span className="text-maroon">already recorded.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-[48ch] text-[17px] leading-relaxed text-ink/75 sm:text-[18px] lg:mx-0">
                Download Shortzy, point it at last week&apos;s video and see what it finds. Free for {site.trialDays}{" "}
                days.
              </p>
              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Button asChild size="lg" className="group">
                  <a href={site.cta.trial.href}>
                    {site.cta.trial.label}
                    <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <a href={site.cta.howItWorks.href}>
                    <Play className="fill-current" />
                    {site.cta.howItWorks.label}
                  </a>
                </Button>
              </div>
              <p className="mt-4 text-[13px] text-ink/70">{site.requirements}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
