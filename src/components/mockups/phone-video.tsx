"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

/** `src` is the path without extension; WebM (VP9) and MP4 (H.264) files sit side by side. */
export type PhoneClip = { src: string; poster: string; title: string };

/**
 * A generic phone playing a real Shortzy-rendered short (9:16 MP4 with burned-in
 * captions). Muted, inline and looping; shows the poster frame under reduced motion.
 */
export function PhoneVideo({ clip, className }: { clip: PhoneClip; className?: string }) {
  const reduce = usePrefersReducedMotion();

  return (
    <div
      className={cn(
        "relative aspect-[9/19] w-full rounded-[13%/6.2%] bg-ink p-[3.2%] shadow-[0_30px_60px_-20px_rgba(41,38,40,0.55)]",
        className,
      )}
      role="img"
      aria-label={`Phone playing a finished vertical short titled "${clip.title}"`}
    >
      <div className="@container relative h-full w-full overflow-hidden rounded-[10.5%/5%] bg-deep">
        <AnimatePresence initial={false}>
          <motion.div
            key={clip.src}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <ClipVideo clip={clip} still={reduce} />
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-[14%] bg-gradient-to-b from-ink/35 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[26%] bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="absolute left-1/2 top-[2.2%] h-[3.2%] w-[30%] -translate-x-1/2 rounded-full bg-ink" />

        <div className="absolute bottom-[17%] right-[4%] flex flex-col items-center gap-[5cqw] text-white">
          {[Heart, MessageCircle, Send].map((Icon, i) => (
            <span key={i} className="grid size-[11cqw] place-items-center rounded-full bg-ink/35">
              <Icon className="size-[6cqw]" strokeWidth={2.2} />
            </span>
          ))}
        </div>

        <div className="absolute inset-x-[5%] bottom-[4.5%] text-white">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={clip.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="line-clamp-2 pr-[14%] text-[4.6cqw] font-semibold leading-tight"
            >
              {clip.title}
            </motion.p>
          </AnimatePresence>
          <p className="mt-[1cqw] text-[3.6cqw] opacity-80">@yourchannel · 0:42</p>
        </div>
      </div>
    </div>
  );
}

function ClipVideo({ clip, still }: { clip: PhoneClip; still: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const v = ref.current;
    if (!v || still) return;
    v.currentTime = 0;
    v.play().catch(() => {
      /* autoplay can be refused; the poster frame stays visible */
    });
  }, [clip.src, still]);

  return (
    <>
      {still ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={clip.poster} alt="" className="h-full w-full object-cover" />
      ) : (
        <video
          ref={ref}
          poster={clip.poster}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration) setProgress(v.currentTime / v.duration);
          }}
          className="h-full w-full object-cover"
        >
          <source src={`${clip.src}.webm`} type="video/webm" />
          <source src={`${clip.src}.mp4`} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-x-[5%] bottom-[2.2%] h-[0.9cqw] overflow-hidden rounded-full bg-white/30">
        <div className="h-full origin-left rounded-full bg-oat" style={{ transform: `scaleX(${still ? 0.38 : progress})` }} />
      </div>
    </>
  );
}
