import { Check, Download, FolderOpen, Info, Plus, Settings, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ClipThumb } from "./phone";
import type { SceneName } from "./scene";
import { cn } from "@/lib/utils";

/*
 * Code-drawn mockup of the Shortzy desktop app (results view). Designed at a
 * fixed 1120 x 700 and scaled by <ScaledFrame>. Swap for a real screenshot
 * when one is available; the layout around it does not depend on internals.
 */

export const APP_W = 1120;
export const APP_H = 700;

export const CLIPS: {
  title: string;
  len: string;
  scene: SceneName;
  reason: string;
  score: number;
  words: string[];
}[] = [
  { title: "Why we killed our free plan", len: "0:48", scene: "host", reason: "Clear payoff", score: 92, words: ["we", "killed", "free"] },
  { title: "The pricing mistake we made twice", len: "0:39", scene: "guest", reason: "Strong opening", score: 88, words: ["we", "made", "it", "twice"] },
  { title: "Charge before you build", len: "0:55", scene: "duo", reason: "Complete answer", score: 85, words: ["charge", "first"] },
  { title: "Our first ten customers", len: "0:44", scene: "studio", reason: "Quotable line", score: 81, words: ["ten", "customers"] },
  { title: "Don't copy competitor pricing", len: "0:36", scene: "host", reason: "Strong opening", score: 77, words: ["don't", "copy", "them"] },
  { title: "What we'd do differently", len: "0:51", scene: "guest", reason: "Clear payoff", score: 74, words: ["do", "it", "again"] },
];

/** Timeline segments: [start, width] as a fraction of the source, with rank. */
export const SEGMENTS: { at: number; w: number; rank: number }[] = [
  { at: 0.06, w: 0.034, rank: 3 },
  { at: 0.19, w: 0.028, rank: 1 },
  { at: 0.335, w: 0.032, rank: 5 },
  { at: 0.515, w: 0.024, rank: 2 },
  { at: 0.665, w: 0.03, rank: 6 },
  { at: 0.835, w: 0.032, rank: 4 },
];

export function waveform(n: number, seed = 1) {
  return Array.from({ length: n }, (_, i) => {
    const v =
      0.5 +
      0.28 * Math.sin(i * 0.37 * seed) +
      0.16 * Math.sin(i * 1.73 + seed) +
      0.08 * Math.sin(i * 4.1);
    return Math.round(Math.max(0.12, Math.min(1, v)) * 1000) / 1000;
  });
}

const PROJECTS = [
  { name: "Founders Podcast · Ep. 42", sub: "6 clips · Today", active: true },
  { name: "Pricing teardown", sub: "8 clips · Tue" },
  { name: "Notion AI walkthrough", sub: "5 clips · Sep 30" },
  { name: "Interview with Dana", sub: "Importing…" },
];

export function AppWindow({ className }: { className?: string }) {
  const bars = waveform(132, 1.3);

  return (
    <div
      className={cn(
        "flex h-[700px] w-[1120px] flex-col overflow-hidden rounded-[20px] border border-pebble bg-white text-ink",
        className,
      )}
    >
      {/* Window chrome */}
      <div className="relative flex h-10 shrink-0 items-center border-b border-pebble/70 bg-paper px-4">
        <div className="flex gap-2">
          <span className="size-3 rounded-full bg-coral" />
          <span className="size-3 rounded-full bg-oat" />
          <span className="size-3 rounded-full bg-pebble" />
        </div>
        <span className="absolute left-1/2 -translate-x-1/2 text-[13px] font-medium text-mute">Shortzy</span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[232px_1fr]">
        {/* Sidebar */}
        <aside className="flex flex-col border-r border-pebble/70 bg-paper/60 p-4">
          <Logo width={120} className="mb-5 ml-1" />
          <div className="mb-5 flex h-10 items-center justify-center gap-2 rounded-lg bg-maroon text-[14px] font-semibold text-white">
            <Plus className="size-4" /> New project
          </div>
          <p className="mb-2 px-1 font-mono text-[11px] uppercase tracking-[0.08em] text-mute">Projects</p>
          <ul className="space-y-1.5">
            {PROJECTS.map((p) => (
              <li
                key={p.name}
                className={cn(
                  "rounded-lg border px-3 py-2",
                  p.active ? "border-maroon bg-rose" : "border-transparent",
                )}
              >
                <p className={cn("truncate text-[13px] font-semibold", p.active && "text-maroon-pressed")}>{p.name}</p>
                <p className="text-[12px] text-mute">{p.sub}</p>
              </li>
            ))}
          </ul>
          <div className="mt-auto space-y-2 border-t border-pebble/70 pt-4">
            <div className="flex items-center gap-2 px-1 text-[13px] text-mute">
              <Settings className="size-4" /> Settings
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-success/40 bg-success-bg px-3 py-2 text-[12px] font-medium text-success">
              <Check className="size-3.5" strokeWidth={3} /> Gemini connected
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-[24px] font-semibold leading-tight tracking-[-0.01em]">
                Founders Podcast · Ep. 42
              </h3>
              <p className="mt-0.5 text-[13px] text-mute">YouTube import · 58:12 · Originals untouched</p>
            </div>
            <div className="flex gap-2">
              <span className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-maroon">
                <FolderOpen className="size-4" /> Show in folder
              </span>
              <span className="flex h-9 items-center gap-1.5 rounded-lg border-2 border-maroon bg-white px-3 text-[13px] font-semibold text-maroon">
                <Download className="size-4" /> Download ZIP
              </span>
            </div>
          </div>

          {/* Source timeline */}
          <div className="mt-4 rounded-xl border border-pebble px-4 pb-3 pt-3">
            <div className="flex items-center justify-between text-[12px] text-mute">
              <span className="font-mono uppercase tracking-[0.08em]">Source</span>
              <span>6 moments · ranked</span>
            </div>
            <div className="relative mt-6 h-12">
              <div className="absolute inset-0 flex items-center gap-[2px]">
                {bars.map((h, i) => (
                  <span key={i} className="flex-1 rounded-full bg-pebble" style={{ height: `${(h * 100).toFixed(1)}%` }} />
                ))}
              </div>
              {SEGMENTS.map((s) => (
                <div
                  key={s.rank}
                  className="absolute inset-y-[-4px] rounded-md border-2 border-maroon bg-oat/70"
                  style={{ left: `${s.at * 100}%`, width: `${s.w * 100}%` }}
                >
                  <span className="absolute -top-[22px] left-1/2 grid size-[18px] -translate-x-1/2 place-items-center rounded-full bg-maroon font-mono text-[10px] font-medium text-white">
                    {s.rank}
                  </span>
                </div>
              ))}
            </div>
            <div className="tabular mt-2 flex justify-between font-mono text-[10.5px] text-mute">
              {["00:00", "14:33", "29:06", "43:39", "58:12"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#3C5872]/50 bg-[#E9EFF5] px-3 py-2 text-[13px] text-[#3C5872]">
            <Info className="size-4 shrink-0" />
            <span>
              <strong className="font-semibold">6 strong moments found.</strong> You asked for 8, so 2 were skipped: no clear payoff.
            </span>
          </div>

          <div className="mb-2.5 mt-4 flex items-center justify-between">
            <p className="text-[14px] font-semibold">
              Clips <span className="font-normal text-mute">· ranked by score</span>
            </p>
            <span className="flex items-center gap-1.5 text-[12px] text-mute">
              <Sparkles className="size-3.5" /> Bold pop captions · 9:16
            </span>
          </div>

          <div className="grid grid-cols-6 gap-3">
            {CLIPS.map((c, i) => (
              <div key={c.title} className="min-w-0">
                <div className="relative">
                  <ClipThumb scene={c.scene} words={c.words} active={1} />
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink">
                    #{i + 1}
                  </span>
                  <span className="absolute right-1.5 top-1.5 rounded-md bg-ink/75 px-1.5 py-0.5 font-mono text-[10px] text-white">
                    {c.len}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-[12.5px] font-semibold leading-snug">{c.title}</p>
                <p className="mt-1 flex items-center justify-between text-[11px] text-mute">
                  <span className="rounded-full bg-rose px-2 py-0.5 text-maroon-pressed">{c.reason}</span>
                  <span className="font-mono tabular">{c.score}</span>
                </p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
