import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const SPECS = [
  { big: "1 to 10", small: "clips per video. Only the strong ones." },
  { big: "9:16", small: "vertical, usually 30 to 60 seconds each." },
  { big: "4 styles", small: "of captions, or none at all." },
  { big: "MP4 · ZIP", small: "one clip or the whole set, saved to your folder." },
];

export function Specs() {
  return (
    <section aria-label="Shortzy at a glance" className="border-b border-pebble bg-paper">
      <Container>
        <dl className="grid grid-cols-2 lg:grid-cols-4">
          {SPECS.map((s, i) => (
            <Reveal
              key={s.big}
              delay={i * 0.08}
              y={16}
              className={[
                "flex flex-col gap-1 py-8 pr-4 sm:py-10",
                i % 2 === 1 ? "border-l border-pebble pl-4 sm:pl-6" : "",
                i > 1 ? "border-t border-pebble lg:border-t-0" : "",
                i === 2 ? "lg:border-l lg:pl-6" : "",
                i === 0 ? "" : "lg:pl-6",
              ].join(" ")}
            >
              <dt className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-none tracking-[-0.03em] text-maroon">
                {s.big}
              </dt>
              <dd className="max-w-[24ch] text-[14px] leading-snug text-mute sm:text-[15px]">{s.small}</dd>
            </Reveal>
          ))}
        </dl>
        <p className="border-t border-pebble py-5 text-center text-[14px] text-mute sm:text-[15px]">
          Works best with <span className="font-semibold text-ink">podcasts</span>,{" "}
          <span className="font-semibold text-ink">interviews</span>,{" "}
          <span className="font-semibold text-ink">tutorials</span> and{" "}
          <span className="font-semibold text-ink">business or AI explainers</span>.
        </p>
      </Container>
    </section>
  );
}
