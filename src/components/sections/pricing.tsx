import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/container";
import { site } from "@/lib/site";

const INCLUDED = [
  "1 to 10 ranked clips per video",
  "YouTube links or your own video files",
  "4 caption presets, plus framing and style controls",
  "MP4 or ZIP export, saved to your own folder",
  "Guided setup for Gemini or Qwen",
];

const AI_POINTS = ["No credit packs", "No markup from Shortzy", "Estimate shown before every run"];

export function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-[720px] text-center">
          <Eyebrow className="justify-center">Pricing</Eyebrow>
          <h2
            id="pricing-title"
            className="mt-4 font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.035em]"
          >
            Clip a real video before you decide.
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-[17px] leading-relaxed text-mute sm:text-[18px]">
            Two costs, both visible up front: the Shortzy app, and the AI usage you pay your provider for directly.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-[1000px] gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <article className="relative rounded-[24px] border-2 border-maroon bg-white p-7 sm:p-9">
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-maroon">Shortzy for Mac</p>
            <p className="mt-4 flex items-baseline gap-3">
              <span className="font-display text-[clamp(3rem,6vw,4.25rem)] font-extrabold leading-none tracking-[-0.04em]">
                {site.trialDays} days
              </span>
              <span className="text-[18px] font-semibold text-mute">free</span>
            </p>
            <p className="mt-2 text-[15px] text-mute">
              {site.priceAfterTrial
                ? `Then ${site.priceAfterTrial}.`
                : "After that, keep going with a paid plan."}
            </p>

            <ul className="mt-7 space-y-3">
              {INCLUDED.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[16px]">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-maroon text-white">
                    <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>

            <Button asChild size="lg" className="group mt-8 w-full">
              <a href={site.cta.trial.href}>
                {site.cta.trial.label}
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            </Button>
            <p className="mt-3 text-center text-[13px] text-mute">
              {site.requirements} · {site.storageHint} · Windows is planned
            </p>
          </article>

          <article className="flex flex-col rounded-[24px] bg-rose p-7 sm:p-9">
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-maroon-pressed">AI usage</p>
            <p className="mt-4 font-display text-[clamp(1.9rem,3.4vw,2.5rem)] font-bold leading-[1.02] tracking-[-0.03em]">
              Paid to your provider, not to us.
            </p>
            <p className="mt-4 text-[16px] leading-relaxed text-ink/80">
              Connect your own Gemini or Qwen account and pay them directly for analysis. Cost depends on video length
              and model, and Shortzy shows you the estimate before anything runs.
            </p>
            <ul className="mt-auto space-y-2 pt-7">
              {AI_POINTS.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-2.5 rounded-xl bg-white/70 px-4 py-3 text-[15px] font-semibold"
                >
                  <Check className="size-4 text-maroon" strokeWidth={3} aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </Container>
    </section>
  );
}
