import { Plus } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";
import { site } from "@/lib/site";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is Shortzy a website or an app?",
    a: "An app. You download it and it runs on your Mac. Projects, previews and exports live in a folder you choose, and you don't need to install anything else to make it work.",
  },
  {
    q: "I've never used an API key. Is that a problem?",
    a: "No. Setup takes you through it in five short steps, with the official link to get a key and a walkthrough for each provider. Think of the key as your AI brain: it lets Shortzy use your AI account, and you pay the provider directly.",
  },
  {
    q: "Does my video get uploaded anywhere?",
    a: "Only what the AI needs. To find moments, Shortzy sends the relevant audio, frames or transcript to the provider you connected. Trimming, framing, captions and export happen on your Mac, and your original file is never changed.",
  },
  {
    q: "How much does the AI part cost?",
    a: "It depends on the video's length and the model you choose. Shortzy shows an estimated range before you start, and checking an estimate is free. Your provider bills you directly; there are no credit packs.",
  },
  {
    q: "Will my clips go viral?",
    a: "Nobody can promise that, and we won't. Each clip gets an editorial score with reasons, like a strong opening or a complete answer, so you can decide what to post first.",
  },
  {
    q: "Can I clip any YouTube video?",
    a: "Shortzy imports public videos and keeps the source attribution. It doesn't get around private or sign-in restricted videos. Only clip videos you own or have permission to reuse.",
  },
  {
    q: "What do I need to run it?",
    a: `A Mac with Apple Silicon running ${site.requirements.replace(" on Apple Silicon", "")}, and ${site.storageHint}. Everything else Shortzy needs is bundled with the app.`,
  },
  {
    q: "Is there a Windows version?",
    a: "Not yet. Windows is planned, but today Shortzy is Mac only.",
  },
  {
    q: `What happens after the ${site.trialDays}-day trial?`,
    a: "To keep making clips, you'll move to a paid plan. Anything you've already exported is saved in your own folder and stays yours either way.",
  },
];

export function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-pebble py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>FAQ</Eyebrow>
          <h2
            id="faq-title"
            className="mt-4 max-w-[12ch] font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.035em]"
          >
            Straight answers.
          </h2>
          <p className="mt-5 max-w-[36ch] text-[17px] leading-relaxed text-mute">
            The things creators ask before they try it.
          </p>
        </div>

        <div className="divide-y divide-pebble border-y border-pebble">
          {FAQS.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-semibold sm:text-[18px] [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-pebble bg-white text-maroon transition-transform duration-200 group-open:rotate-45">
                  <Plus className="size-4" aria-hidden="true" />
                </span>
              </summary>
              <p className="max-w-[62ch] pb-6 pr-12 text-[16px] leading-relaxed text-mute">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
