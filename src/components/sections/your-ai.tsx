import { ArrowUpRight, HardDrive, KeyRound } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/container";

const PROVIDERS = [
  { name: "Gemini", by: "Google", badge: "Recommended", available: true },
  { name: "Qwen", by: "Alibaba Cloud", available: true },
  { name: "Kimi", by: "Moonshot AI", badge: "Coming soon", available: false },
];

const STAYS = [
  "Your original video files, never modified",
  "Every preview, render and export",
  "Your projects and earlier clip sets",
  "Your API key, kept in your system's secure keychain",
];

export function YourAI() {
  return (
    <section id="your-ai" aria-labelledby="ai-title" className="on-dark grain relative bg-deep py-24 text-white sm:py-32">
      <div aria-hidden="true" className="perf-rail absolute inset-x-0 top-5 h-3 text-paper/10" />
      <Container className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <Eyebrow className="text-rose">Your AI, your bill</Eyebrow>
          <h2
            id="ai-title"
            className="mt-4 max-w-[14ch] font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.035em]"
          >
            Bring your own AI brain.
          </h2>
          <div className="mt-6 max-w-[50ch] space-y-4 text-[17px] leading-relaxed text-white/80 sm:text-[18px]">
            <p>
              Shortzy connects to your own Gemini or Qwen account with a private API key. You pay the provider
              directly, at their rates. Shortzy doesn&apos;t sell AI credits and doesn&apos;t add a markup.
            </p>
            <p>
              Never made an API key? Setup walks you through it one step at a time, with the official link and a
              short walkthrough.
            </p>
          </div>

          <ul className="mt-9 grid gap-3 sm:grid-cols-3" aria-label="Supported AI providers">
            {PROVIDERS.map((p) => (
              <li
                key={p.name}
                className={
                  p.available
                    ? "rounded-2xl border border-white/15 bg-white/[0.06] p-4"
                    : "rounded-2xl border border-dashed border-white/20 p-4 text-white/60"
                }
              >
                <p className="font-display text-[22px] font-bold tracking-[-0.02em]">{p.name}</p>
                <p className="text-[13px] text-white/60">by {p.by}</p>
                {p.badge && (
                  <span
                    className={
                      p.available
                        ? "mt-3 inline-block rounded-full bg-oat px-2.5 py-0.5 text-[12px] font-semibold text-ink"
                        : "mt-3 inline-block rounded-full border border-white/25 px-2.5 py-0.5 text-[12px] font-semibold text-white/75"
                    }
                  >
                    {p.badge}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="self-center rounded-[24px] bg-paper p-6 text-ink sm:p-8">
          <h3 className="font-display text-[24px] font-bold tracking-[-0.02em]">What goes where</h3>
          <p className="mt-1 text-[15px] text-mute">Local-first, not offline. Here&apos;s exactly what that means.</p>

          <div className="mt-6 rounded-2xl border border-pebble bg-white p-5">
            <p className="flex items-center gap-2 text-[15px] font-semibold">
              <span className="grid size-8 place-items-center rounded-lg bg-rose text-maroon">
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </span>
              Sent to the AI you chose
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-mute">
              The audio, frames or transcript it needs to find your moments. Only for analysis, and only to the
              provider you connected.
            </p>
          </div>

          <div className="mt-3 rounded-2xl border border-pebble bg-white p-5">
            <p className="flex items-center gap-2 text-[15px] font-semibold">
              <span className="grid size-8 place-items-center rounded-lg bg-maroon text-white">
                <HardDrive className="size-4" aria-hidden="true" />
              </span>
              Stays on your computer
            </p>
            <ul className="mt-3 space-y-2">
              {STAYS.map((s) => (
                <li key={s} className="flex items-start gap-2 text-[15px] text-ink">
                  <span aria-hidden="true" className="mt-[9px] size-1.5 shrink-0 rounded-full bg-maroon" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-5 flex items-start gap-2 text-[14px] leading-snug text-mute">
            <KeyRound className="mt-0.5 size-4 shrink-0 text-maroon" aria-hidden="true" />
            Shortzy doesn&apos;t run a cloud that receives your videos. Disconnecting removes the key from Shortzy;
            your provider account stays yours.
          </p>
        </div>
      </Container>
    </section>
  );
}
