import { Check } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const BY_HAND = [
  "Rewatch the whole hour for the good bits",
  "Write down every timestamp",
  "Cut each clip and trim the dead air",
  "Reframe every clip to vertical",
  "Caption every word, then fix the typos",
  "Write a title for each one",
  "Export, rename, repeat",
];

const WITH_SHORTZY = ["Paste the link", "Pick clips and a caption style", "Review, then export"];

export function Problem() {
  return (
    <section aria-labelledby="problem-title" className="py-24 sm:py-32">
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <Eyebrow>The slog</Eyebrow>
          <h2
            id="problem-title"
            className="mt-4 max-w-[14ch] font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.035em]"
          >
            The recording was the easy part.
          </h2>
          <div className="mt-6 max-w-[52ch] space-y-4 text-[1.0625rem] leading-relaxed text-mute sm:text-[1.125rem]">
            <p>
              You already made something good. Turning it into shorts is where the week goes: hunting for the moments
              that land, cutting, reframing, captioning, exporting. Then doing it again for the next one.
            </p>
            <p>
              Shortzy does that part. You keep the decisions: which clips to post, which to skip, and what to change.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.12} className="relative mx-auto w-full max-w-[520px]">
          <div className="-rotate-[1.5deg] rounded-[24px] border border-pebble bg-white p-6 sm:p-8">
            <p className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-mute">By hand, every time</p>
            <ol className="mt-4 space-y-3">
              {BY_HAND.map((t, i) => (
                <li key={t} className="flex items-start gap-3 text-[0.9375rem] text-ink/75 sm:text-[1rem]">
                  <span className="mt-0.5 font-mono text-[0.75rem] text-mute tabular">{String(i + 1).padStart(2, "0")}</span>
                  <span className="decoration-coral decoration-2 [text-decoration-line:line-through]">{t}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="on-dark relative -mt-6 ml-auto w-[82%] rotate-[2deg] rounded-[24px] bg-maroon p-6 text-white sm:-mr-6 sm:w-[64%] sm:p-7">
            <p className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-rose">With Shortzy</p>
            <ol className="mt-3 space-y-2.5">
              {WITH_SHORTZY.map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-[1rem] font-semibold">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-paper text-maroon">
                    <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />
                  </span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
