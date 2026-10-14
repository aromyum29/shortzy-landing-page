import { ArrowRight, Clapperboard, Mic, Scissors, Smartphone } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

/*
 * Who it's for, and why shorts: one long video fans out into 9:16 shorts for the three
 * places people post them, then the four kinds of people who need that feed handled.
 * Shortzy exports MP4s; it does not post for you, so the visual says "ready to post".
 */

const SHORTS = [
  { poster: "/product/clips/podcast-clip-1.webp", where: "YouTube Shorts" },
  { poster: "/product/clips/podcast-clip-2.webp", where: "Instagram Reels" },
  { poster: "/product/clips/podcast-clip-3.webp", where: "TikTok" },
];

const WHO = [
  {
    icon: Clapperboard,
    title: "Creators",
    body: "You make long videos and want a steady stream of shorts without taking on a second job.",
  },
  {
    icon: Scissors,
    title: "Clippers",
    body: "You cut long videos into shorts for the channels you work with. More clips, no per-clip credits.",
  },
  {
    icon: Mic,
    title: "Podcasters",
    body: "Every episode hides a handful of moments worth posting. Find them in one pass.",
  },
  {
    icon: Smartphone,
    title: "Influencers",
    body: "Keep Shorts, Reels and TikTok fed from the videos you already make.",
  },
];

function Fan() {
  return (
    <div aria-hidden="true" className="mx-auto flex max-w-[28rem] flex-col items-center gap-4">
      {/* The long video */}
      <div className="w-full max-w-[20rem]">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/product/stills/podcast.webp" alt="" loading="lazy" decoding="async" className="size-full object-cover" />
          <span className="absolute left-2.5 top-2.5 rounded-md bg-white px-1.5 py-0.5 font-mono text-[0.625rem] font-medium text-ink">
            Sample
          </span>
          <span className="tabular absolute bottom-2.5 right-2.5 rounded-md bg-ink/85 px-1.5 py-0.5 font-mono text-[0.625rem] font-medium text-white">
            44:48
          </span>
        </div>
        <p className="mt-2 text-center font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-mute">One long video</p>
      </div>

      <ArrowRight className="size-5 shrink-0 rotate-90 text-maroon" />

      {/* The shorts */}
      <div className="w-full">
        <ul className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {SHORTS.map((s, i) => (
            <li key={s.where} className="flex flex-col items-center">
              <div
                className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-ink"
                style={{ transform: `translateY(${[8, 0, 8][i]}px)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.poster} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
              </div>
              <span className="mt-4 whitespace-nowrap rounded-full border border-pebble bg-white px-2 py-0.5 text-[0.6875rem] font-semibold text-ink sm:text-[0.75rem]">
                {s.where}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-center font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-mute">9:16 shorts, ready to post</p>
      </div>
    </div>
  );
}

export function Audience() {
  return (
    <section id="who-its-for" aria-labelledby="who-title" className="bg-white py-24 sm:py-32">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <Reveal>
            <Eyebrow>Who it&apos;s for</Eyebrow>
            <h2
              id="who-title"
              className="mt-4 text-balance font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.035em]"
            >
              Shorts get seen. Long videos get watched. <span className="text-maroon">Do both.</span>
            </h2>
            <p className="mt-6 max-w-[34rem] text-[1.0625rem] leading-relaxed text-mute sm:text-[1.125rem]">
              On YouTube, Instagram and TikTok, short videos now pull far more views and engagement than long ones. They are
              also the best trailer your long videos can get: a short reaches people who would never press play on an hour,
              and sends the curious ones back to the full episode.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-[24px] border border-pebble bg-paper p-5 sm:p-7">
              <Fan />
              <p className="mt-6 border-t border-pebble/70 pt-4 text-center text-[0.8125rem] text-mute">
                Shortzy exports 9:16 MP4s with captions. You post them wherever your audience is.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.05} className="mt-16 sm:mt-20">
          <p className="text-[1.0625rem] font-semibold text-ink">For anyone who needs their short-form content handled:</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {WHO.map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-[20px] border border-pebble bg-paper p-5">
                <span className="grid size-10 place-items-center rounded-xl bg-maroon text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-4 font-display text-[1.375rem] font-bold tracking-[-0.02em]">{title}</p>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-mute">{body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
