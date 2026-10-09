"use client";

/* eslint-disable @next/next/no-img-element -- decorative, fixed-size art inside an aria-hidden canvas */

import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, motion, useTransform } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clapperboard,
  Download,
  EllipsisVertical,
  FileVideo,
  FolderOpen,
  HardDrive,
  Link,
  LoaderCircle,
  Maximize,
  Play,
  Plus,
  Scissors,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Upload,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoClock } from "./context";
import { AI, CLIPS, COST, LIBRARY, OUTPUT, PROJECT, STEPS } from "./data";
import { importProgressAt, processProgressAt, scrollAt, type Frame, type View } from "./timeline";

/*
 * Recreation of the Shortzy desktop app on a fixed 1280 x 800 canvas, using
 * the app's own tokens (not the landing tokens): ink #252327, muted #69656b,
 * primary #432b36, warm paper #f7f6f5, line #e8e6e8, input border #918b93.
 * Positions follow the measured QA screenshots. Everything here is
 * presentational and lives inside an aria-hidden, inert canvas.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;
const QUICK = { duration: 0.2, ease: EASE } as const;
const SPRING = { type: "spring", bounce: 0, visualDuration: 0.24 } as const;
const POP = { type: "spring", bounce: 0.35, visualDuration: 0.3 } as const;

const abs = (left: number, top: number, width?: number, height?: number): CSSProperties => ({
  position: "absolute",
  left,
  top,
  width,
  height,
});

/* ------------------------------------------------------------------ */
/* Primitives                                                           */
/* ------------------------------------------------------------------ */

type BtnState = "idle" | "hover" | "press" | "disabled" | "loading";

function stateOf(f: Frame, id: string, opts: { disabled?: boolean; loading?: boolean } = {}): BtnState {
  if (opts.loading) return "loading";
  if (opts.disabled) return "disabled";
  if (f.press === id) return "press";
  if (f.hover === id) return "hover";
  return "idle";
}

function Btn({
  variant = "primary",
  state = "idle",
  style,
  className,
  children,
}: {
  variant?: "primary" | "secondary" | "text";
  state?: BtnState;
  style?: CSSProperties;
  className?: string;
  children: ReactNode;
}) {
  const look = {
    primary: {
      idle: "bg-[#432b36] text-white",
      hover: "bg-[#35212a] text-white",
      press: "bg-[#281820] text-white scale-[0.985]",
      disabled: "bg-[#efedf0] text-[#716b73]",
      loading: "bg-[#432b36] text-white",
    },
    secondary: {
      idle: "border border-[#918b93] bg-white text-[#252327]",
      hover: "border border-[#918b93] bg-[#f4f2f4] text-[#252327]",
      press: "border border-[#918b93] bg-[#ede9ec] text-[#252327] scale-[0.985]",
      disabled: "border border-[#e8e6e8] bg-white text-[#716b73]",
      loading: "border border-[#918b93] bg-white text-[#252327]",
    },
    text: {
      idle: "text-[#252327]",
      hover: "text-[#432b36]",
      press: "text-[#281820] scale-[0.985]",
      disabled: "text-[#716b73]",
      loading: "text-[#252327]",
    },
  }[variant][state];
  return (
    <div
      style={style}
      className={cn(
        "flex items-center justify-center gap-[8px] whitespace-nowrap rounded-[8px] text-[13px] font-[550] transition-[background-color,color,transform] duration-150 [&_svg]:size-[15px] [&_svg]:shrink-0",
        variant !== "text" && "h-[42px] px-[16px]",
        look,
        className,
      )}
    >
      {children}
    </div>
  );
}

function Spinner({ size = 18, className }: { size?: number; className?: string }) {
  const { t, still } = useDemoClock();
  const rotate = useTransform(t, (v) => (v * 0.45) % 360);
  return (
    <motion.span
      className={cn("inline-grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size, rotate: still ? 0 : rotate }}
    >
      <LoaderCircle style={{ width: size, height: size }} strokeWidth={2} />
    </motion.span>
  );
}

function Pill({ tone, children, style }: { tone: "neutral" | "success"; children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={style}
      className={cn(
        "inline-flex h-[24px] items-center whitespace-nowrap rounded-full px-[9px] text-[11px] font-[550]",
        tone === "success" ? "bg-[#edf5f0] text-[#2e6751]" : "bg-[#f7f6f5] text-[#69656b]",
      )}
    >
      {children}
    </span>
  );
}

function Illus({ name, width, style }: { name: string; width: number; style?: CSSProperties }) {
  return (
    <img
      src={`/product/illustrations/${name}.webp`}
      alt=""
      width={width}
      draggable={false}
      style={{ width, height: "auto", ...style }}
      className="pointer-events-none block select-none"
    />
  );
}

function Divider({ top, left = 0, width = "100%" }: { top: number; left?: number; width?: number | string }) {
  return <div style={{ ...abs(left, top, undefined, 1), width }} className="bg-[#e8e6e8]" />;
}

/* ------------------------------------------------------------------ */
/* Shell                                                                */
/* ------------------------------------------------------------------ */

export function Sidebar({ f }: { f: Frame }) {
  return (
    <div className="absolute inset-y-0 left-0 z-10 w-[208px] border-r border-[#e8e6e8] bg-[#f7f6f5]">
      <div style={abs(24, 32)} className="flex items-center gap-[9px]">
        <img src="/brand/mascot/logo-mascot.webp" alt="" width={32} height={32} draggable={false} className="size-[32px]" />
        <span className="text-[23px] font-[750] leading-none tracking-[-0.7px]">
          shortzy<span className="ml-[3px] text-[#432b36]">.</span>
        </span>
      </div>
      <p style={abs(22, 101)} className="text-[11px] leading-[16px] text-[#69656b]">
        Your workspace
      </p>
      <Btn state={stateOf(f, "newProject")} style={abs(12, 143, 183, 40)} className="h-[40px]">
        <Plus />
        New project
      </Btn>
      <div
        style={abs(12, 199, 183, 38)}
        className="flex items-center gap-[11px] rounded-[7px] bg-[#ede9ec] px-[11px] text-[14px] font-[500]"
      >
        <FolderOpen className="size-[16px]" strokeWidth={1.75} />
        Projects
      </div>
      <div style={abs(12, 245, 183, 36)} className="flex items-center gap-[11px] px-[11px] text-[14px]">
        <SlidersHorizontal className="size-[16px]" strokeWidth={1.75} />
        Settings
        <ChevronDown className="ml-auto size-[16px] text-[#69656b]" strokeWidth={1.75} />
      </div>
      <div style={abs(12, 725, 183, 1)} className="bg-[#e8e6e8]" />
      <HardDrive style={abs(20, 756)} className="size-[17px] text-[#69656b]" strokeWidth={1.75} />
      <p style={abs(46, 745)} className="text-[12px] font-[500] leading-[18px]">
        On your computer
      </p>
      <p style={abs(46, 766)} className="text-[11px] leading-[16px] text-[#69656b]">
        Local workspace
      </p>
    </div>
  );
}

function Topbar() {
  return (
    <div style={abs(208, 0, 1072, 56)} className="border-b border-[#e8e6e8] bg-white">
      <span style={abs(32, 18)} className="text-[11px] leading-[16px] text-[#69656b]">
        Your video workspace
      </span>
      <span style={{ position: "absolute", right: 32, top: 18 }} className="flex items-center gap-[7px] text-[11px] leading-[16px] text-[#69656b]">
        <span className="size-[6px] rounded-full bg-[#2e6751]" />
        Stored locally
      </span>
    </div>
  );
}

/** A view: topbar plus content, scrolled by its own scroll function of the clock. */
function ViewScroll({ view, children }: { view: View; children: ReactNode }) {
  const { t } = useDemoClock();
  const y = useTransform(t, (v) => -scrollAt(view, v));
  return (
    <motion.div className="absolute inset-x-0 top-0 h-[1900px]" style={{ y }}>
      <Topbar />
      {children}
    </motion.div>
  );
}

function ProjectHeader({ title, sub, pill }: { title: string; sub: string; pill?: ReactNode }) {
  return (
    <>
      <div style={abs(240, 93)} className="flex items-center gap-[10px] text-[12px] leading-[16px] text-[#69656b]">
        <ArrowLeft className="size-[15px]" strokeWidth={1.75} />
        All projects
      </div>
      <p style={abs(240, 131)} className="whitespace-nowrap text-[26px] font-[600] leading-[34px] tracking-[-0.025em]">
        {title}
      </p>
      <p style={abs(240, 173)} className="whitespace-nowrap text-[13px] leading-[20px] text-[#69656b]">
        {sub}
      </p>
      {pill && <div style={{ position: "absolute", right: 32, top: 152 }}>{pill}</div>}
    </>
  );
}

type StepMark = "current" | "done" | "upcoming" | "busy";

function Stepper({ marks }: { marks: StepMark[] }) {
  return (
    <div className="relative h-[26px]">
      {STEPS.map((label, i) => {
        const m = marks[i];
        return (
          <div key={label} style={abs(i * 170, 0)} className="flex h-[26px] items-center gap-[8px]">
            <span
              className={cn(
                "grid size-[26px] place-items-center rounded-full text-[11px] font-[600] transition-colors duration-200",
                m === "current" && "bg-[#432b36] text-white",
                m === "done" && "bg-[#ede9ec] text-[#432b36]",
                (m === "upcoming" || m === "busy") && "border border-[#e3e0e3] bg-white text-[#69656b]",
              )}
            >
              {m === "done" ? (
                <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={POP}>
                  <Check className="size-[13px]" strokeWidth={2.25} />
                </motion.span>
              ) : m === "busy" ? (
                <Spinner size={14} className="text-[#69656b]" />
              ) : (
                i + 1
              )}
            </span>
            <span
              className={cn(
                "text-[12px] leading-[16px]",
                m === "current" ? "font-[650] text-[#252327]" : "text-[#69656b]",
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const marksFor = (current: number, busyUpload = false): StepMark[] =>
  STEPS.map((_, i) => (i === current ? "current" : i < current ? (i === 0 && busyUpload ? "busy" : "done") : "upcoming"));

/** Header block under the project title: optional import strip, stepper, divider, then the stage. */
function ProjectFlow({
  marks,
  strip,
  stageHeight = 1500,
  children,
}: {
  marks: StepMark[];
  strip?: ReactNode;
  stageHeight?: number;
  children: ReactNode;
}) {
  return (
    <div style={abs(240, 219, 1008)}>
      {strip}
      <Stepper marks={marks} />
      <div className="mt-[24px] h-px bg-[#e8e6e8]" />
      <div className="relative mt-[32px]" style={{ height: stageHeight }}>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* S1 Library                                                           */
/* ------------------------------------------------------------------ */

function LibraryView({ f }: { f: Frame }) {
  return (
    <ViewScroll view="library">
      <p style={abs(240, 86)} className="text-[26px] font-[600] leading-[34px] tracking-[-0.025em]">
        Your projects
      </p>
      <p style={abs(240, 128)} className="text-[13px] leading-[20px] text-[#69656b]">
        A home for your videos. A starting point for your next clip.
      </p>
      <Btn state={stateOf(f, "libraryNew")} style={abs(1115, 98, 133, 39)} className="h-[39px]">
        <Plus />
        New project
      </Btn>
      <div style={abs(240, 182)} className="flex items-center gap-[10px]">
        <span className="text-[14px] font-[550] leading-[22px]">All projects</span>
        <span className="grid h-[24px] min-w-[24px] place-items-center rounded-full bg-[#f4f2f4] px-[7px] text-[11px] text-[#69656b]">
          8
        </span>
      </div>
      <div
        style={abs(1021, 176, 227, 34)}
        className="flex items-center gap-[9px] rounded-[8px] border border-[#918b93] px-[12px] text-[12px] text-[#69656b]"
      >
        <Search className="size-[15px]" strokeWidth={1.75} />
        Find a project…
      </div>
      {LIBRARY.map((p, i) => {
        const left = 240 + (i % 4) * 257;
        const top = 229 + Math.floor(i / 4) * 248;
        return (
          <div key={p.title} style={abs(left, top, 237, 230)}>
            <div className="relative h-[133px] overflow-hidden rounded-[8px] bg-[#29262a]">
              <img src={`/product/stills/${p.still}.webp`} alt="" draggable={false} className="size-full object-cover" />
              <span className="absolute bottom-[10px] right-[10px] grid h-[28px] w-[49px] place-items-center rounded-[6px] bg-[#252327]/85 text-[11px] font-[600] tabular-nums text-white">
                {p.length}
              </span>
            </div>
            <p className="mt-[12px] truncate text-[14px] font-[550] leading-[22px]">{p.title}</p>
            <Pill tone={p.status === "source" ? "success" : "neutral"} style={{ marginTop: 3 }}>
              {p.status === "source" ? "Source ready" : "Clips ready"}
            </Pill>
            <div className="mt-[7px] flex items-center justify-between pr-[5px]">
              <span className="text-[11px] leading-[16px] text-[#69656b]">{p.date}</span>
              <ArrowRight className="size-[15px] text-[#69656b]" strokeWidth={1.75} />
            </div>
          </div>
        );
      })}
    </ViewScroll>
  );
}

/* ------------------------------------------------------------------ */
/* S2 Upload                                                            */
/* ------------------------------------------------------------------ */

function Caret() {
  const { t, still } = useDemoClock();
  const opacity = useTransform(t, (v) => (v % 1060 < 560 ? 1 : 0));
  return <motion.span className="ml-px inline-block h-[17px] w-px translate-y-[3px] bg-[#252327]" style={{ opacity: still ? 1 : opacity }} />;
}

function UploadView({ f }: { f: Frame }) {
  const upload = f.seg === "upload";
  const selected = f.drop === "selected";
  const cardH = !upload ? 415 : selected ? 447 : 479;
  return (
    <ViewScroll view="upload">
      <ProjectHeader title="Start with a video." sub="Paste a YouTube link or choose a video from your device." />
      <ProjectFlow marks={marksFor(0)}>
        {/* Form card */}
        <motion.div
          className="absolute left-0 top-0 w-[602px] overflow-hidden rounded-[12px] border border-[#e8e6e8] bg-white"
          initial={false}
          animate={{ height: cardH }}
          transition={QUICK}
        >
          <p style={abs(24, 24)} className="text-[13px] font-[550] leading-[20px]">
            Project name
          </p>
          <motion.div
            style={abs(24, 52, 553, 42)}
            className="flex items-center rounded-[8px] border border-[#918b93] px-[12px] text-[14px] outline outline-2 outline-offset-2 outline-[#702f42]"
            initial={false}
            animate={{ backgroundColor: f.nameFlash ? "#ede9ec" : "#ffffff" }}
            transition={{ duration: f.nameFlash ? 0.05 : 0.3 }}
          >
            {f.nameFilled ? (
              <span className="truncate">{PROJECT.title}</span>
            ) : (
              <span className="text-[#69656b]">e.g. A conversation worth sharing</span>
            )}
            {f.nameFilled && <Caret />}
          </motion.div>
          <p style={abs(24, 114)} className="text-[13px] font-[550] leading-[20px]">
            Video source
          </p>
          <div style={abs(24, 141, 553, 44)} className="rounded-[8px] bg-[#f7f6f5]">
            <motion.div
              className="absolute top-[3px] h-[38px] w-[273px] rounded-[6px] bg-white shadow-[0_1px_3px_rgba(37,35,39,0.09)]"
              initial={false}
              animate={{ x: upload ? 277 : 3 }}
              transition={{ type: "spring", bounce: 0, visualDuration: 0.18 }}
            />
            {(
              [
                ["segYoutube", "YouTube link", Link, !upload, 3],
                ["segUpload", "Upload video", Upload, upload, 277],
              ] as const
            ).map(([id, label, Icon, on, x]) => (
              <div
                key={id}
                style={abs(x, 3, 273, 38)}
                className={cn(
                  "flex items-center justify-center gap-[8px] text-[13px] transition-colors duration-150",
                  on || f.hover === id ? "text-[#252327]" : "text-[#69656b]",
                  f.press === id && "scale-[0.985]",
                )}
              >
                <Icon className="size-[15px]" strokeWidth={1.75} />
                {label}
              </div>
            ))}
          </div>

          <AnimatePresence initial={false} mode="popLayout">
            {!upload ? (
              <motion.div key="yt" className="absolute inset-x-0 top-[205px]" exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                <p style={abs(24, 0)} className="text-[13px] font-[550] leading-[20px]">
                  YouTube video URL
                </p>
                <div style={abs(24, 28, 553, 42)} className="flex items-center rounded-[8px] border border-[#918b93] px-[12px] text-[14px] text-[#69656b]">
                  https://www.youtube.com/watch?v=…
                </div>
                <p style={abs(24, 81, 520)} className="text-[12px] leading-[20px] text-[#69656b]">
                  We’ll download an available public video and prepare a local preview. No separate upload needed. Private,
                  restricted, or unavailable videos may not import.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="up"
                style={abs(24, 205, 553)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18, delay: 0.05 }}
              >
                <motion.div
                  className={cn(
                    "flex flex-col items-center justify-center rounded-[8px] border text-center transition-colors duration-150",
                    f.drop === "idle" && "border-dashed border-[#918b93] bg-white",
                    f.drop === "dragging" && "border-solid border-[#432b36] bg-[#ede9ec]",
                    selected && "border-dashed border-[#918b93] bg-[#f7f6f5]",
                  )}
                  initial={false}
                  animate={{ height: selected ? 150 : 182 }}
                  transition={QUICK}
                >
                  {selected ? (
                    <motion.div
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={SPRING}
                    >
                      <FileVideo className="size-[32px] text-[#432b36]" strokeWidth={1.5} />
                      <span className="mt-[10px] text-[16px] font-[550] leading-[22px]">{PROJECT.file}</span>
                      <span className="mt-[4px] text-[13px] leading-[20px] text-[#69656b]">
                        {PROJECT.size} · Click to choose a different video
                      </span>
                    </motion.div>
                  ) : (
                    <>
                      <Upload className="size-[29px] text-[#252327]" strokeWidth={1.5} />
                      <span className="mt-[10px] text-[16px] font-[550] leading-[22px]">Choose a video</span>
                      <span className="mt-[11px] text-[13px] leading-[20px] text-[#69656b]">or drop it here</span>
                      <span className="mt-[16px] text-[11px] leading-[16px] text-[#69656b]">MP4, MOV, MKV, WebM, M4V, AVI</span>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer, pinned to the card bottom */}
          <div className="absolute inset-x-[24px] bottom-[24px] flex items-end justify-between">
            <div className="flex items-start gap-[8px] pb-[6px] text-[11px] leading-[17px] text-[#69656b]">
              <ShieldCheck className="mt-[2px] size-[14px]" strokeWidth={1.75} />
              <span className="w-[100px]">{upload ? "Your original stays untouched" : "Prepared on your computer"}</span>
            </div>
            {upload ? (
              <Btn
                state={stateOf(f, "create", { disabled: f.create === "disabled", loading: f.create === "loading" })}
                style={{ width: f.create === "loading" ? 172 : 147 }}
              >
                {f.create === "loading" ? (
                  <>
                    <Spinner size={15} />
                    Starting import…
                  </>
                ) : (
                  <>
                    <ArrowRight />
                    Create project
                  </>
                )}
              </Btn>
            ) : (
              <Btn state="disabled" style={{ width: 190 }}>
                <ArrowRight />
                Import from YouTube
              </Btn>
            )}
          </div>
        </motion.div>

        {/* Right column */}
        <div style={abs(643, 16, 365)}>
          <Illus name="workspace" width={170} />
          <p className="mt-[20px] text-[16px] font-[600] leading-[24px]">A space for every source.</p>
          <p className="mt-[6px] w-[310px] text-[13px] leading-[21px] text-[#69656b]">
            Keep each video and its work together, ready to pick up where you left off.
          </p>
          <div className="mt-[24px] space-y-[18px]">
            {[
              ["Choose your source", "Paste a link or upload a video."],
              ["Make it yours", "Choose your AI, captions, and clip length while the video imports."],
              ["Find your shorts", "Check the estimate, then let Shortzy find and edit the moments."],
            ].map(([title, body], i) => (
              <div key={title} className="flex gap-[13px]">
                <span className="grid size-[24px] shrink-0 place-items-center rounded-full border border-[#e3e0e3] text-[11px] text-[#69656b]">
                  {i + 1}
                </span>
                <span>
                  <span className="block text-[14px] font-[550] leading-[22px]">{title}</span>
                  <span className="block text-[12px] leading-[18px] text-[#69656b]">{body}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </ProjectFlow>
    </ViewScroll>
  );
}

/* ------------------------------------------------------------------ */
/* S3 + S4 Customize                                                    */
/* ------------------------------------------------------------------ */

function ImportStrip({ open }: { open: boolean }) {
  const { t } = useDemoClock();
  const scaleX = useTransform(t, importProgressAt);
  return (
    <motion.div
      className="overflow-hidden"
      initial={false}
      animate={open ? { height: 59, marginTop: 2, marginBottom: 23, opacity: 1 } : { height: 0, marginTop: 0, marginBottom: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
    >
      <div className="relative flex h-[59px] items-center gap-[12px] rounded-[8px] bg-[#ede9ec] px-[14px]">
        <Spinner size={18} className="text-[#69656b]" />
        <div>
          <p className="text-[12px] leading-[17px]">Copying video to your workspace</p>
          <p className="text-[10px] leading-[15px] text-[#69656b]">Keep customizing while we bring in your video.</p>
        </div>
        <div className="absolute right-[16px] top-[27px] h-[5px] w-[200px] overflow-hidden rounded-full bg-[#d9d5d9]">
          <motion.div className="h-full origin-left rounded-full bg-[#432b36]" style={{ scaleX }} />
        </div>
      </div>
    </motion.div>
  );
}

function SourcePreview() {
  return (
    <div style={abs(728, 0, 280, 301)} className="overflow-hidden rounded-[12px] border border-[#e8e6e8] bg-[#f7f6f5]">
      <div className="relative h-[175px] bg-[#29262a]">
        <img src={PROJECT.still} alt="" draggable={false} className="size-full object-contain" />
        <div className="absolute inset-x-[16px] bottom-[16px] text-white">
          <div className="flex items-center gap-[10px] text-[12px]">
            <Play className="size-[13px] fill-current" />
            <span>0:00</span>
            <span className="ml-auto flex items-center gap-[14px] opacity-80">
              <Volume2 className="size-[14px]" />
              <Maximize className="size-[13px]" />
              <EllipsisVertical className="size-[14px]" />
            </span>
          </div>
          <div className="mt-[10px] h-[3px] rounded-full bg-white/35">
            <div className="h-full w-[18%] rounded-full bg-white/80" />
          </div>
        </div>
      </div>
      <div className="px-[17px] pt-[13px]">
        <p className="text-[13px] font-[600] leading-[19px]">{PROJECT.file}</p>
        <p className="mt-[6px] text-[12px] leading-[18px] text-[#69656b]">
          {PROJECT.length} · {PROJECT.resolution}
        </p>
        <p className="mt-[14px] flex items-center gap-[7px] text-[11px] text-[#69656b]">
          <ShieldCheck className="size-[13px]" strokeWidth={1.75} />
          Original preserved
        </p>
      </div>
    </div>
  );
}

const TABS = [
  { id: "ai", label: "Your AI", x: 0, w: 42 },
  { id: "shorts", label: "Your shorts", x: 60, w: 66 },
  { id: "style", label: "Style & trim", x: 143, w: 66 },
] as const;

const HEADINGS = {
  ai: { h: "Choose your creative brain.", p: "Your AI finds the moments. Shortzy takes care of the edit.", art: "ai", top: 6 },
  shorts: { h: "What would you like to make?", p: "A few choices to shape your next set of shorts.", art: "trim", top: 2 },
  style: { h: "Give your shorts a signature.", p: "Choose a caption style, then refine only what you need.", art: "captions", top: -4 },
} as const;

function CustomizeView({ f }: { f: Frame }) {
  const tab = TABS.find((x) => x.id === f.tab)!;
  const head = HEADINGS[f.tab];
  return (
    <ViewScroll view="customize">
      <ProjectHeader
        title={PROJECT.title}
        sub={PROJECT.file}
        pill={
          <AnimatePresence initial={false} mode="wait">
            <motion.span key={String(f.importing)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {f.importing ? <Pill tone="neutral">Preparing video</Pill> : <Pill tone="success">Source ready</Pill>}
            </motion.span>
          </AnimatePresence>
        }
      />
      <ProjectFlow marks={marksFor(1, f.importing)} strip={<ImportStrip open={f.importing} />}>
        <div style={abs(0, 0, 688)}>
          <p className="text-[11px] font-[600] leading-[16px] tracking-[0.035em] text-[#69656b]">Make it yours</p>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={f.tab}
              className="absolute inset-x-0 top-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              <p style={abs(0, 29)} className="whitespace-nowrap text-[24px] font-[600] leading-[30px] tracking-[-0.65px]">
                {head.h}
              </p>
              <p style={abs(0, 68)} className="whitespace-nowrap text-[14px] leading-[22px] text-[#69656b]">
                {head.p}
              </p>
              <Illus name={head.art} width={96} style={abs(592, head.top)} />
            </motion.div>
          </AnimatePresence>

          {/* Tabs */}
          <div style={abs(0, 124, 688, 34)} className="border-b border-[#e8e6e8]">
            {TABS.map((x) => (
              <span
                key={x.id}
                style={abs(x.x, 0, x.w)}
                className={cn(
                  "whitespace-nowrap text-center text-[12px] leading-[16px] transition-colors duration-150",
                  x.id === f.tab ? "font-[650] text-[#252327]" : "text-[#69656b]",
                  f.hover === `tab${x.id === "shorts" ? "Shorts" : x.id === "style" ? "Style" : "Ai"}` && "text-[#252327]",
                )}
              >
                {x.label}
              </span>
            ))}
            <motion.span
              className="absolute bottom-[-1px] h-[2px] rounded-full bg-[#432b36]"
              initial={false}
              animate={{ left: tab.x, width: tab.w }}
              transition={{ type: "spring", bounce: 0, visualDuration: 0.2 }}
            />
          </div>

          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={f.tab}
              className="absolute inset-x-0 top-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              {f.tab === "ai" && <YourAiTab />}
              {f.tab === "shorts" && <YourShortsTab f={f} />}
              {f.tab === "style" && <StyleTab f={f} />}
            </motion.div>
          </AnimatePresence>
        </div>
        <SourcePreview />
      </ProjectFlow>
    </ViewScroll>
  );
}

function YourAiTab() {
  return (
    <>
      <img src={AI.logo} alt="" width={32} height={32} draggable={false} style={abs(4, 236, 32, 32)} />
      <p style={abs(56, 210)} className="text-[18px] font-[600] leading-[24px]">
        {AI.provider}
      </p>
      <p style={abs(56, 240)} className="text-[13px] leading-[20px] text-[#69656b]">
        {AI.model}
      </p>
      <span style={abs(56, 271)} className="inline-flex h-[23px] items-center rounded-full bg-[#edf5f0] px-[9px] text-[11px] font-[600] text-[#2e6751]">
        Connected
      </span>
      <Btn variant="secondary" style={abs(564, 231, 124)}>
        Change model
      </Btn>
      <p style={abs(0, 323)} className="flex items-center gap-[8px] text-[14px] leading-[22px]">
        Connect another AI
      </p>
      <Divider top={386} />
      <Btn style={abs(575, 407, 113)}>
        Continue
        <ArrowRight />
      </Btn>
    </>
  );
}

function SelectBox({ top, h, label, value, hover }: { top: number; h: number; label: string; value: string; hover?: boolean }) {
  return (
    <div
      style={abs(0, top, 479, h)}
      className={cn(
        "rounded-[8px] border px-[13px] pt-[9px] transition-colors duration-150",
        hover ? "border-[#432b36]" : "border-[#918b93]",
      )}
    >
      <p className="text-[11px] font-[500] leading-[16px] text-[#69656b]">{label}</p>
      <p className="mt-[4px] text-[13px] leading-[20px]">{value}</p>
      <ChevronDown className="absolute right-[14px] top-1/2 size-[16px] -translate-y-1/2 text-[#69656b]" strokeWidth={1.75} />
    </div>
  );
}

function YourShortsTab({ f }: { f: Frame }) {
  return (
    <>
      <SelectBox top={186} h={60} label="Number of clips" value={OUTPUT.clips} hover={f.hover === "select1"} />
      <SelectBox top={266} h={59} label="Video shape" value={OUTPUT.shape} />
      <SelectBox top={345} h={60} label="Clip length" value={OUTPUT.length} />
      <Divider top={465} />
      <Btn style={abs(575, 486, 113)}>
        Continue
        <ArrowRight />
      </Btn>
    </>
  );
}

const PRESETS = [
  { id: "presetBold", name: "Bold pop", x: 0, y: 247, w: 222, h: 149 },
  { id: "presetWord", name: "Word highlight", x: 233, y: 247, w: 222, h: 149 },
  { id: "presetCondensed", name: "Condensed", x: 465, y: 247, w: 223, h: 149 },
  { id: "presetClean", name: "Clean box", x: 0, y: 407, w: 222, h: 143 },
  { id: "presetNone", name: "No captions", x: 233, y: 407, w: 222, h: 143 },
] as const;

function PresetSample({ id, pulse }: { id: string; pulse: boolean }) {
  switch (id) {
    case "presetBold":
      return <span className="text-[12px] font-[800] leading-[15px] text-white">YOUR NEXT<br />GREAT IDEA</span>;
    case "presetWord":
      return (
        <span className="flex flex-col items-center text-[12px] font-[700] leading-[16px] text-white">
          Your next
          <motion.span
            className="bg-[#e7ada0] px-[4px] text-[#43202b]"
            animate={pulse ? { scale: [1, 1.14, 1] } : { scale: 1 }}
            transition={{ duration: 0.36, ease: EASE }}
          >
            great
          </motion.span>
          idea
        </span>
      );
    case "presetCondensed":
      return (
        <span className="font-display text-[19px] font-[800] leading-[20px] tracking-[0.01em] text-white [font-stretch:75%]">
          YOUR NEXT
          <br />
          GREAT IDEA
        </span>
      );
    case "presetClean":
      return <span className="bg-white px-[8px] py-[7px] text-[13px] font-[550] leading-[19px] text-[#252327]">Your next great idea</span>;
    default:
      return <Clapperboard className="size-[22px] text-[#69656b]" strokeWidth={1.5} />;
  }
}

function StyleTab({ f }: { f: Frame }) {
  return (
    <>
      <p style={abs(0, 211)} className="text-[13px] font-[600] leading-[20px]">
        Caption style
      </p>
      {PRESETS.map((p) => {
        const selected = p.id === "presetWord";
        const hover = f.hover === p.id;
        const press = f.press === p.id;
        return (
          <motion.div
            key={p.id}
            style={abs(p.x, p.y, p.w, p.h)}
            className={cn(
              "rounded-[10px] transition-colors duration-150",
              selected ? "border-2 border-[#432b36] bg-[#f7f6f5] p-[4px]" : "border border-[#e8e6e8] p-[5px]",
              !selected && hover && "bg-[#f4f2f4]",
              selected && hover && "bg-[#ede9ec]",
            )}
            animate={{ scale: press ? 0.98 : 1 }}
            transition={{ duration: 0.11 }}
          >
            <div
              className={cn(
                "grid h-[100px] place-items-center rounded-[6px] text-center",
                p.id === "presetNone" ? "bg-[#f7f6f5]" : "bg-[#432b36]",
              )}
            >
              <PresetSample id={p.id} pulse={selected && f.presetPulse} />
            </div>
            <p
              className="flex items-center justify-center gap-[5px] text-[11px] font-[600] leading-[16px]"
              style={{ marginTop: p.h === 149 ? 13 : 10 }}
            >
              {p.name}
              {selected && (
                <motion.span key={String(f.presetPulse)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={POP}>
                  <Check className="size-[13px]" strokeWidth={2.25} />
                </motion.span>
              )}
            </p>
          </motion.div>
        );
      })}
      <Divider top={576} />
      <p style={abs(0, 599)} className="flex items-center gap-[10px] text-[14px] leading-[22px]">
        <SlidersHorizontal className="size-[16px]" strokeWidth={1.75} />
        Fine-tune captions &amp; framing
      </p>
      <Divider top={645} />
      <p style={abs(0, 664)} className="text-[14px] font-[550] leading-[22px]">
        Find a moment <span className="ml-[6px] text-[12px] font-[400] text-[#69656b]">Optional</span>
      </p>
      <p style={abs(0, 704)} className="text-[14px] leading-[22px] text-[#69656b]">
        For example: the advice about starting a small business
      </p>
      <Divider top={756} />
      <p style={abs(0, 775)} className="flex items-center gap-[10px] text-[14px] leading-[22px]">
        <Scissors className="size-[16px]" strokeWidth={1.75} />
        Trim the source video
      </p>
      <span style={{ position: "absolute", right: 0, top: 777 }} className="text-[12px] leading-[18px] text-[#69656b]">
        Optional
      </span>
      <Divider top={817} />
      <Divider top={865} />
      <p style={abs(0, 896)} className="text-[12px] leading-[18px] text-[#69656b]">
        Choices saved
      </p>
      <Btn variant="text" style={abs(482, 896)} className="h-[22px]">
        <ArrowLeft />
        Back
      </Btn>
      <Btn state={stateOf(f, "analyze")} style={abs(544, 886, 144)}>
        Analyze video
        <ArrowRight />
      </Btn>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* S5 to S7 Review: analyze, estimate, confirm                         */
/* ------------------------------------------------------------------ */

function ReviewView({ f }: { f: Frame }) {
  const current = f.stage === "analyze" ? 2 : f.stage === "estimate" ? 3 : 4;
  return (
    <ViewScroll view="review">
      <ProjectHeader title={PROJECT.title} sub={PROJECT.file} pill={<Pill tone="success">Source ready</Pill>} />
      <ProjectFlow marks={marksFor(current)} stageHeight={700}>
        <AnimatePresence initial={false}>
          <motion.div
            key={f.stage}
            className="absolute inset-0"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={QUICK}
          >
            {f.stage === "analyze" && <AnalyzeStage f={f} />}
            {f.stage === "estimate" && <EstimateStage f={f} />}
            {f.stage === "confirm" && <ConfirmStage f={f} />}
          </motion.div>
        </AnimatePresence>
      </ProjectFlow>
    </ViewScroll>
  );
}

function StageHeading({ eyebrow, title, art, artWidth, artTop, logo }: { eyebrow: string; title: string; art: string; artWidth: number; artTop: number; logo?: boolean }) {
  const x = logo ? 176 : 124;
  return (
    <>
      {logo && <img src={AI.logo} alt="" width={32} height={32} draggable={false} style={abs(128, 63, 32, 32)} />}
      <p style={abs(x, 32)} className="text-[11px] font-[600] leading-[16px] tracking-[0.035em] text-[#69656b]">
        {eyebrow}
      </p>
      <p style={abs(x, 62)} className="whitespace-nowrap text-[27px] font-[600] leading-[34px] tracking-[-0.7px]">
        {title}
      </p>
      <Illus name={art} width={artWidth} style={abs(1124 - 240 - artWidth, artTop)} />
    </>
  );
}

function CheckMark({ state }: { state: "pending" | "busy" | "done" }) {
  if (state === "busy") return <Spinner size={18} className="text-[#432b36]" />;
  if (state === "pending") return <span className="block size-[18px] rounded-full border-[1.5px] border-[#e3e0e3]" />;
  return (
    <motion.span className="block" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={POP}>
      <Check className="size-[18px] text-[#432b36]" strokeWidth={2} />
    </motion.span>
  );
}

function AnalyzeStage({ f }: { f: Frame }) {
  const rows = [
    { title: "Video ready", sub: `${PROJECT.length} selected`, state: f.checks >= 1 ? "done" : "pending" },
    { title: "Output choices reviewed", sub: "Up to 6 clips · 9:16", state: f.checks >= 2 ? "done" : "pending" },
    {
      title: "Processing estimate",
      sub: f.checks >= 3 ? "Ready to review" : "Calculating from your selected model",
      state: f.checks >= 3 ? "done" : f.calculating ? "busy" : "pending",
    },
  ] as const;
  return (
    <>
      <StageHeading eyebrow="A quick local check" title="Getting the details right." art="moments" artWidth={104} artTop={34} />
      <p style={abs(124, 111, 530)} className="text-[14px] leading-[24px] text-[#69656b]">
        Shortzy checks the video length and your choices on your computer. No video has been sent to your AI yet.
      </p>
      {rows.map((r, i) => (
        <div key={r.title}>
          <div style={abs(124, 207 + i * 82, 760, 50)} className="flex items-center gap-[16px]">
            <CheckMark state={r.state} />
            <div>
              <p className="text-[14px] leading-[22px]">{r.title}</p>
              <p className="mt-[2px] text-[12px] leading-[18px] text-[#69656b]">{r.sub}</p>
            </div>
          </div>
          <Divider top={273 + i * 82} left={124} width={760} />
        </div>
      ))}
      <Divider top={470} left={124} width={760} />
      <Btn variant="text" style={abs(610, 503)} className="h-[20px] gap-[4px]">
        <ArrowLeft />
        Customize
      </Btn>
      <Btn state={stateOf(f, "seeCost", { disabled: f.checks < 3 })} style={abs(717, 491, 167)}>
        See cost estimate
        <ArrowRight />
      </Btn>
    </>
  );
}

function CostCard({ label, ready, top }: { label: string; ready: boolean; top: number }) {
  return (
    <div style={abs(124, top, 760, 142)} className="rounded-[12px] bg-[#f7f6f5] px-[28px] pt-[28px]">
      <p className="text-[13px] leading-[20px] text-[#69656b]">{label}</p>
      <div className="relative mt-[10px] h-[52px]">
        <AnimatePresence initial={false} mode="wait">
          {ready ? (
            <motion.p
              key="value"
              className="flex items-baseline gap-[6px] whitespace-nowrap"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <span className="text-[40px] font-[650] leading-[52px] tracking-[-1px] tabular-nums">{COST.estimate}</span>
              <span className="text-[13px] text-[#69656b]">USD</span>
            </motion.p>
          ) : (
            <motion.p
              key="busy"
              className="flex h-[52px] items-center gap-[10px] text-[14px] text-[#69656b]"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <Spinner size={18} />
              Updating your estimate…
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Recap({ top }: { top: number }) {
  return (
    <>
      {[
        [PROJECT.length, "Selected video"],
        ["Up to 6", "Finished shorts"],
        ["On your computer", "Editing & export"],
      ].map(([a, b], i) => (
        <div key={b} style={abs(124 + i * 260, top)}>
          <p className="text-[14px] font-[550] leading-[22px]">{a}</p>
          <p className="mt-[2px] text-[12px] leading-[18px] text-[#69656b]">{b}</p>
        </div>
      ))}
    </>
  );
}

function EstimateStage({ f }: { f: Frame }) {
  return (
    <>
      <StageHeading eyebrow={`${AI.provider} · ${AI.model}`} title="Know the cost before you create." art="cost" artWidth={100} artTop={33} logo />
      <CostCard label="Estimated AI cost for your selected video" ready={f.estimateReady} top={151} />
      <Recap top={316} />
      <p style={abs(124, 393, 500)} className="text-[14px] leading-[24px] text-[#69656b]">
        Calculated from this video’s length, your model, and output choices. Your provider bills the AI usage; actual cost may vary.
      </p>
      <p style={abs(124, 462)} className="flex items-center gap-[8px] text-[13px] font-[600] leading-[20px]">
        <span className="text-[9px]">▶</span>
        Cost details &amp; processing limit
      </p>
      <Divider top={510} left={124} width={760} />
      <Btn variant="text" style={abs(612, 542)} className="h-[20px] gap-[4px]">
        <ArrowLeft />
        Customize
      </Btn>
      <Btn state={stateOf(f, "reviewConfirm")} style={abs(719, 531, 165)}>
        Review &amp; confirm
        <ArrowRight />
      </Btn>
    </>
  );
}

function ConfirmStage({ f }: { f: Frame }) {
  return (
    <>
      <StageHeading eyebrow={`${AI.provider} · ${AI.model}`} title="Ready to make your shorts?" art="trim" artWidth={100} artTop={37} logo />
      <CostCard label="Estimated charge to your AI account" ready top={143} />
      <Recap top={307} />
      <p style={abs(124, 387)} className="text-[14px] leading-[22px] text-[#69656b]">
        9:16 video · {OUTPUT.length} each · {OUTPUT.style}
      </p>
      <motion.span
        style={abs(124, 431, 18, 18)}
        className={cn(
          "grid place-items-center rounded-[4px] border transition-colors duration-150",
          f.consent ? "border-[#432b36] bg-[#432b36] text-white" : "border-[#69656b] bg-white",
          f.hover === "consent" && !f.consent && "border-[#432b36]",
        )}
        animate={{ scale: f.press === "consent" ? 0.9 : 1 }}
        transition={{ duration: 0.11 }}
      >
        {f.consent && (
          <motion.span initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={POP}>
            <Check className="size-[13px]" strokeWidth={3} />
          </motion.span>
        )}
      </motion.span>
      <p style={abs(154, 429, 520)} className="text-[14px] leading-[20px]">
        Send my selected video’s prepared content to {AI.provider} for paid analysis using my AI account.
      </p>
      <p style={abs(124, 490, 540)} className="text-[14px] leading-[24px] text-[#69656b]">
        If there are fewer distinct moments, we’ll make fewer clips. Analysis still uses AI credits.
      </p>
      <Divider top={566} left={124} width={760} />
      <Btn variant="text" style={abs(600, 598)} className="h-[20px] gap-[4px]">
        <ArrowLeft />
        Back to estimate
      </Btn>
      <Btn
        state={stateOf(f, "find", { disabled: f.find === "disabled", loading: f.find === "loading" })}
        style={abs(744, 587, 140)}
      >
        {f.find === "loading" ? <Spinner size={15} /> : <Clapperboard />}
        Find my clips
      </Btn>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* S8 + S9 Processing and results                                       */
/* ------------------------------------------------------------------ */

function ProcessBar() {
  const { t } = useDemoClock();
  const scaleX = useTransform(t, processProgressAt);
  return (
    <div style={abs(20, 115, 968, 5)} className="overflow-hidden rounded-full bg-[#e8e6e8]">
      <motion.div className="h-full origin-left rounded-full bg-[#432b36]" style={{ scaleX }} />
    </div>
  );
}

function FinishView({ f }: { f: Frame }) {
  const { still } = useDemoClock();
  return (
    <ViewScroll view="finish">
      <ProjectHeader
        title={PROJECT.title}
        sub={PROJECT.file}
        pill={f.results ? <Pill tone="neutral">Clips ready</Pill> : <Pill tone="success">Making clips</Pill>}
      />
      <ProjectFlow marks={marksFor(5)} stageHeight={1500}>
        <motion.div
          className="absolute inset-x-0 top-0 overflow-hidden rounded-[12px] bg-[#f7f6f5]"
          initial={false}
          animate={{ height: f.results ? 147 : 190 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <AnimatePresence initial={false}>
            {!f.results ? (
              <motion.div key="processing" className="absolute inset-0" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <Spinner size={18} className="absolute left-[21px] top-[23px] text-[#432b36]" />
                <AnimatePresence initial={false} mode="wait">
                  <motion.p
                    key={String(f.framing)}
                    style={abs(56, 20)}
                    className="whitespace-nowrap text-[18px] font-[600] leading-[24px]"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.16 }}
                  >
                    {f.framing ? "Framing and captioning your shorts" : "Finding your strongest moments"}
                  </motion.p>
                </AnimatePresence>
                <p style={abs(56, 51, 545)} className="text-[13px] leading-[20px]">
                  AI finds the moments. Your computer handles the editing and export. You can leave this project open or return to
                  your library.
                </p>
                <ProcessBar />
                <p style={abs(20, 144)} className="text-[13px] font-[500] leading-[20px] text-[#432b36]">
                  Stop processing
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="ready"
                className="absolute inset-0"
                initial={still ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.08 }}
              >
                <motion.div
                  style={abs(20, 20)}
                  initial={still ? false : { scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={POP}
                >
                  <Illus name="export" width={96} />
                </motion.div>
                <p style={abs(132, 20)} className="text-[18px] font-[600] leading-[24px]">
                  Your clips are ready.
                </p>
                <p style={abs(132, 51)} className="text-[13px] leading-[20px]">
                  6 of up to 6 requested clips are ready to review.
                </p>
                <p style={abs(20, 95)} className="text-[13px] leading-[20px] text-[#69656b]">
                  Recorded AI usage: {COST.recorded} USD · your provider’s bill is authoritative.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {f.results && <Results f={f} />}
      </ProjectFlow>
    </ViewScroll>
  );
}

function Results({ f }: { f: Frame }) {
  const { still } = useDemoClock();
  const shown = f.cardsIn || still;
  return (
    <>
      <motion.div
        className="absolute inset-x-0 top-[175px]"
        initial={false}
        animate={{ opacity: shown ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      >
        <p style={abs(0, 4)} className="text-[20px] font-[600] leading-[26px]">
          Made from your video.
        </p>
        <p style={abs(0, 38)} className="text-[13px] leading-[20px] text-[#69656b]">
          Highest editorial potential first. Scores are AI estimates, not predictions of views.
        </p>
        <Btn variant="secondary" style={abs(869, 4, 139)}>
          <Download />
          Download all
        </Btn>
      </motion.div>
      {CLIPS.map((c, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <motion.div
            key={c.title}
            style={abs([0, 343, 685][col], 253 + row * 634, col === 1 ? 322 : 323, 610)}
            initial={false}
            animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: 0.3, ease: EASE, delay: still ? 0 : i * 0.06 }}
          >
            <ClipBox poster={c.poster} hideBar={i === 0 && f.playing && !still} />
            <p className="mt-[14px] text-[11px] leading-[16px] text-[#69656b]">Clip {i + 1} · 0:42</p>
            <p className="mt-[8px] text-[15px] font-[600] leading-[21px]">{c.title}</p>
            <span className="mt-[9px] inline-flex h-[22px] items-center gap-[6px] rounded-full bg-[#f4f2f4] px-[8px] text-[11px] font-[600] text-[#432b36]">
              <Star className="size-[13px]" strokeWidth={1.75} />
              {c.score}/100 · AI estimate
            </span>
            <p className="mt-[8px] text-[13px] leading-[21px] text-[#69656b]">{c.reason}</p>
            <Btn variant="secondary" className="absolute inset-x-0 bottom-0">
              <Download />
              Download MP4
            </Btn>
          </motion.div>
        );
      })}
    </>
  );
}

/** A clip player at rest: 0:00, so the scrubber shows only its track. */
function ClipBox({ poster, hideBar }: { poster: string; hideBar: boolean }) {
  return (
    <div className="relative h-[400px] overflow-hidden rounded-[10px] bg-[#252327]">
      <img src={poster} alt="" draggable={false} className="absolute left-1/2 top-0 h-[400px] w-[225px] -translate-x-1/2 object-cover" />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[80px] bg-[linear-gradient(to_bottom,transparent,rgba(20,18,20,0.45))] px-[16px] pt-[34px] text-white"
        initial={false}
        animate={{ opacity: hideBar ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-[10px] text-[12px]">
          <Play className="size-[13px] fill-current" />
          <span className="tabular-nums">0:00 / 0:42</span>
          <span className="ml-auto flex items-center gap-[16px] opacity-80">
            <Volume2 className="size-[14px]" />
            <Maximize className="size-[13px]" />
            <EllipsisVertical className="size-[14px]" />
          </span>
        </div>
        <div className="mt-[11px] h-[3px] rounded-full bg-white/35" />
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* View switch                                                          */
/* ------------------------------------------------------------------ */

export function AppView({ f }: { f: Frame }) {
  switch (f.view) {
    case "library":
      return <LibraryView f={f} />;
    case "upload":
      return <UploadView f={f} />;
    case "customize":
      return <CustomizeView f={f} />;
    case "review":
      return <ReviewView f={f} />;
    default:
      return <FinishView f={f} />;
  }
}

/** The dragged file, drawn on the canvas next to the cursor hotspot. */
export function FileGhost() {
  return (
    <div className="flex h-[40px] w-[260px] items-center gap-[9px] rounded-[8px] bg-white/[0.92] px-[12px] text-[12px] font-[500] shadow-[0_8px_24px_rgba(37,35,39,0.25)]">
      <FileVideo className="size-[18px] shrink-0 text-[#432b36]" strokeWidth={1.75} />
      <span className="truncate">{PROJECT.file}</span>
    </div>
  );
}
