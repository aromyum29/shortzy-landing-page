import { ArrowRight } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

/*
 * The value in three blocks, right after the hero (the Ada and Loom pattern on Mobbin): one big
 * statement each and a single supporting line, so a visitor gets why Shortzy is different before
 * reading anything else. Each block points to the section that backs it up.
 */

const VALUE = [
  {
    n: "01",
    big: "Pay once.",
    line: "Own Shortzy for life. No subscription, no credits.",
    href: "#your-ai",
    link: "How you pay",
    tone: "bg-maroon text-white",
    sub: "text-white/75",
    linkTone: "text-rose",
  },
  {
    n: "02",
    big: "Up to 10x less.",
    line: "Per minute than credit plans. Your own AI bills you per video.",
    href: "#your-ai",
    link: "See the math",
    tone: "bg-deep text-white",
    sub: "text-white/75",
    linkTone: "text-coral",
  },
  {
    n: "03",
    big: "On your computer.",
    line: "Shortzy edits locally, on Mac or Windows. Your files stay in your folder.",
    href: "#how-it-works",
    link: "How it works",
    tone: "bg-oat text-ink",
    sub: "text-ink/75",
    linkTone: "text-maroon-pressed",
  },
];

export function Value() {
  return (
    <section aria-labelledby="value-title" className="py-14 sm:py-24">
      <Container>
        <Reveal>
          <Eyebrow>Why Shortzy</Eyebrow>
          <h2
            id="value-title"
            className="mt-4 max-w-[18ch] text-balance font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.035em]"
          >
            Clipping you own, <span className="text-maroon">not rent.</span>
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-3 sm:mt-12 md:grid-cols-3 md:gap-4">
          {VALUE.map((v, i) => (
            <Reveal key={v.n} delay={0.06 * i} className="h-full">
              <article className={cn("flex h-full flex-col rounded-[24px] p-6 sm:p-7 md:min-h-[17rem]", v.tone)}>
                <span className={cn("tabular font-mono text-[0.75rem]", v.sub)}>{v.n}</span>
                <h3 className="mt-6 font-display text-[clamp(2rem,3.4vw,2.75rem)] font-bold leading-[0.95] tracking-[-0.035em] md:mt-auto">
                  {v.big}
                </h3>
                <p className={cn("mt-3 max-w-[30ch] text-[0.9375rem] leading-snug", v.sub)}>{v.line}</p>
                <a
                  href={v.href}
                  className={cn(
                    "mt-4 inline-flex min-h-11 items-center gap-1.5 self-start text-[0.875rem] font-semibold underline-offset-4 hover:underline",
                    v.linkTone,
                  )}
                >
                  {v.link} <ArrowRight className="size-3.5" aria-hidden="true" />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
