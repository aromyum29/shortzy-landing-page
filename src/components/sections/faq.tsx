import { Plus } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";
import { site } from "@/lib/site";
import { Reveal } from "@/components/ui/reveal";

// Ordered by what creators ask first: cost, then privacy and setup, then the rest.
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "How much does it cost?",
    a: "Pay once and Shortzy is yours for life (price not set yet). Then your own AI bills you per video. No subscription, no credits.",
  },
  {
    q: "How much will the AI part cost me?",
    a: "Shortzy shows an estimate before anything runs. Samples: $0.43 to $1.33 for a 44:48 video on Gemini Flash 3.8, $0.03 to $0.06 for 24 minutes on Qwen 3.8 Omni Flash. Your provider's bill is final.",
  },
  {
    q: "Do I need an AI account?",
    a: "Yes, Gemini or Qwen with an API key (Kimi coming soon). Setup walks you through it.",
  },
  {
    q: "Does my video get uploaded anywhere?",
    a: "Not to Shortzy. Your AI gets a prepared copy of the audio and video to find moments. Editing and export happen on your computer.",
  },
  {
    q: "What do I need to run it?",
    a: `A Mac (Apple Silicon, macOS 14+) or a Windows PC, ${site.storageHint}, and internet for YouTube imports and AI. Windows is coming alongside Mac.`,
  },
  {
    q: "Will these clips get me views?",
    a: "Nobody can promise that. Each clip gets a score with reasons, so you can decide what to post first.",
  },
  {
    q: "Can I clip any YouTube video?",
    a: "Public videos only, with source attribution kept. Only clip videos you own or have permission to reuse.",
  },
  {
    q: "What does joining the wishlist mean?",
    a: "We email you when Shortzy is ready. No payment, no spam, leave any time.",
  },
];

export function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-16 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>FAQ</Eyebrow>
          <h2
            id="faq-title"
            className="mt-4 max-w-[12ch] font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.035em]"
          >
            Straight answers.
          </h2>
          <p className="mt-5 max-w-[36ch] text-pretty text-[1.0625rem] leading-relaxed text-mute">
            Cost, privacy and setup.
          </p>
        </Reveal>

        <Reveal delay={0.12} className="divide-y divide-pebble border-y border-pebble">
          {FAQS.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 transition-colors duration-100 hover:text-maroon active:text-maroon-pressed text-[1.0625rem] font-semibold sm:text-[1.125rem] [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-pebble bg-white text-maroon transition-transform duration-200 group-open:rotate-45">
                  <Plus className="size-4" aria-hidden="true" />
                </span>
              </summary>
              <p className="max-w-[62ch] pb-6 pr-12 text-[1rem] leading-relaxed text-mute">{f.a}</p>
            </details>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
