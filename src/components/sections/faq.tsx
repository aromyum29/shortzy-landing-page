import { Plus } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";
import { site } from "@/lib/site";
import { Reveal } from "@/components/ui/reveal";

// Ordered by what creators ask first: cost, then privacy and setup, then the rest.
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "How much does it cost?",
    a: "Shortzy is a one-time purchase, and the price isn't set yet. There's no subscription, because there's no Shortzy cloud to keep paying for, and there are no credits. Your only running cost is your own AI usage, billed by your provider.",
  },
  {
    q: "How much will the AI part cost me?",
    a: "It depends on the video's length and your model, and Shortzy shows an estimated range before anything runs. Two samples from the app: $0.43 to $1.33 for a 44:48 video on Gemini Flash 3.8 (recommended), and $0.03 to $0.06 for a 24-minute video on Qwen 3.8 Omni Flash. Your provider's bill is final.",
  },
  {
    q: "Do I need an AI account?",
    a: "Yes, a Gemini or Qwen account with an API key. Kimi is coming soon. Any billing is with that provider, not Shortzy. Never made a key? Setup walks you through it and checks the connection. You can look around first, but you need an AI connected to make clips.",
  },
  {
    q: "Does my video get uploaded anywhere?",
    a: "Not to Shortzy. To find moments, a prepared copy of the audio and video goes to the AI provider you connected, under their terms. Editing and export happen on your computer, your original is never changed, and your key stays in your system's credential store.",
  },
  {
    q: "Is Shortzy a website or an app?",
    a: `An app for your Mac (Apple Silicon, macOS 14 or later) or Windows PC, with everything it needs bundled in. Set aside ${site.storageHint} for your workspace to start. You'll need an internet connection for YouTube imports and AI analysis.`,
  },
  {
    q: "Is it coming to Windows?",
    a: "Yes. Shortzy is coming to both Mac and Windows. Join the wishlist and we'll tell you when each version is ready.",
  },
  {
    q: "Will these clips get me views?",
    a: "Nobody can promise that, and we won't. Each clip gets an editorial score with reasons, like a strong opening or a complete payoff, so you can decide what to post first.",
  },
  {
    q: "Can I clip any YouTube video?",
    a: "Shortzy imports public videos, keeps the source attribution and doesn't get around private or sign-in restricted videos. Only clip videos you own or have permission to reuse.",
  },
  {
    q: "What does joining the wishlist mean?",
    a: "We'll email you when Shortzy is ready to buy and download. There's no payment to join, no spam, and you can leave the list at any time.",
  },
];

export function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-24 sm:py-32">
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
            What creators ask first: cost, privacy and setup.
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
