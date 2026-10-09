"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { nav, site } from "@/lib/site";
import { cn } from "@/lib/utils";

const SPRING = { type: "spring", bounce: 0, visualDuration: 0.3 } as const;
const INSTANT = { duration: 0 } as const;
/** Height of the bar (h-[72px]); section anchors land 88px down via scroll-margin-top. */
const BAR = 72;
/** The phone header's compact call to action. Its accessible name is the full wishlist label. */
const COMPACT_CTA = "Join";

/**
 * Which section is under the middle of the viewport, so the nav can say "you are here".
 * Every top-level section is watched, not only the linked ones, so the highlight clears over
 * sections without a nav link (hero, problem, spec strip, wishlist) instead of sticking to the
 * last linked one.
 */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("main > section");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id || null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

/** True once the hero's button row (#hero-cta) has scrolled up under the bar. */
function usePastHeroCta() {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const el = document.getElementById("hero-cta");
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e) setPast(!e.isIntersecting && e.boundingClientRect.top < BAR);
      },
      { rootMargin: `-${BAR}px 0px 0px 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return past;
}

/** Calls back once the page stops scrolling, or soon after if no scroll starts. */
function whenScrollSettles(done: () => void) {
  let last = window.scrollY;
  let moved = false;
  let still = 0;
  let frames = 0;
  const tick = () => {
    const y = window.scrollY;
    if (y !== last) {
      moved = true;
      still = 0;
    } else {
      still += 1;
    }
    last = y;
    frames += 1;
    if ((moved && still >= 4) || (!moved && frames >= 20) || frames >= 180) done();
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * After an in-page link from the header, move focus to the target section's heading once the
 * scroll ends, so keyboard and screen reader users continue from there. The browser's own hash
 * navigation does the scrolling; the heading gets tabindex="-1" so it can take focus.
 */
function focusSectionAfterScroll(href: string) {
  const section = href.startsWith("#") ? document.getElementById(href.slice(1)) : null;
  if (!section) return;
  whenScrollSettles(() => {
    const labelledBy = section.getAttribute("aria-labelledby");
    const heading =
      (labelledBy && document.getElementById(labelledBy)) ||
      section.querySelector<HTMLElement>("h1, h2") ||
      section;
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  });
}

export function Nav() {
  // null until hydrated: the bar starts solid, so with JavaScript off (or before hydration on a slow
  // connection) it never turns see-through over the content below.
  const [scrolled, setScrolled] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const active = useActiveSection();
  const pastHero = usePastHeroCta();
  const reduce = useReducedMotion();

  // Phones only (the sm+ bar always has the full button). Hidden again at the wishlist itself.
  const showJoin = pastHero && active !== "wishlist";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /** Header links that unmount or hide after use hand focus to the section they point at. */
  const follow = (href: string) => () => {
    setOpen(false);
    focusSectionAfterScroll(href);
  };

  return (
    <header
      className={cn("sticky top-0 z-50 transition-colors duration-200", scrolled !== false || open ? "bg-paper" : "bg-paper/0")}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <div className="relative z-10 mx-auto flex h-[72px] w-full max-w-[1200px] items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
        <a href="#top" aria-label="Shortzy home" className="shrink-0 transition-transform duration-100 active:scale-[0.97]">
          <Logo />
        </a>

        <nav aria-label="Main" className="ml-4 hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const current = active === item.href.slice(1);
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={current ? "true" : undefined}
                    className={cn(
                      "relative inline-flex min-h-11 items-center rounded-lg px-3 text-[0.9375rem] font-medium transition-[color,background-color,transform] duration-100 hover:bg-white hover:text-maroon active:scale-[0.97]",
                      current ? "text-maroon" : "text-ink/80",
                    )}
                  >
                    {item.label}
                    {current && (
                      <motion.span
                        layoutId="nav-current"
                        transition={SPRING}
                        aria-hidden="true"
                        className="absolute inset-x-3 bottom-1.5 h-[2px] rounded-full bg-maroon"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Phones: once the hero buttons are gone, a compact way to join stays in reach. */}
          <AnimatePresence initial={false}>
            {showJoin && (
              <motion.div
                key="join"
                className="sm:hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={reduce ? INSTANT : SPRING}
              >
                <Button asChild size="sm" className="min-h-11 px-3 min-[360px]:px-4">
                  <a
                    href={site.cta.wishlist.href}
                    aria-label={site.cta.wishlist.label}
                    onClick={follow(site.cta.wishlist.href)}
                  >
                    {COMPACT_CTA}
                  </a>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <Button asChild size="sm" className="hidden min-h-11 sm:inline-flex">
            <a href={site.cta.wishlist.href}>{site.cta.wishlist.shortLabel}</a>
          </Button>
          <button
            ref={toggleRef}
            type="button"
            className="grid size-11 place-items-center rounded-lg text-ink transition-transform duration-100 hover:bg-white active:scale-[0.94] lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Scroll edge: a soft fade where content passes under the bar, instead of a hard rule. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-full h-4 bg-gradient-to-b from-ink/[0.07] to-transparent transition-opacity duration-200",
          scrolled === true && !open ? "opacity-100" : "opacity-0",
        )}
      />

      {/*
        Mobile menu: an overlay below the bar (absolute, top-full), so opening and closing it never
        moves the page and in-page links land where they should. It drops out of the bar and
        returns the same way; a scrim behind it closes it on tap.
      */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="scrim"
            aria-hidden="true"
            className="absolute inset-x-0 top-full h-dvh bg-ink/25 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduce ? INSTANT : { duration: 0.2 }}
            onClick={() => setOpen(false)}
          />
        )}
        {open && (
          <motion.div
            id={menuId}
            key="menu"
            initial={{ clipPath: "inset(0% 0% 100% 0%)", opacity: 0 }}
            animate={{ clipPath: "inset(0% 0% -20% 0%)", opacity: 1 }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)", opacity: 0 }}
            transition={reduce ? INSTANT : { clipPath: SPRING, opacity: { duration: 0.2 } }}
            className="absolute inset-x-0 top-full border-t border-pebble bg-paper shadow-[0_16px_24px_-20px_rgba(41,38,40,0.4)] lg:hidden"
          >
            <nav aria-label="Mobile" className="mx-auto max-w-[1200px] px-4 pb-6 pt-2 sm:px-6">
              <ul className="divide-y divide-pebble/70">
                {nav.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={follow(item.href)}
                      aria-current={active === item.href.slice(1) ? "true" : undefined}
                      className="flex min-h-12 items-center text-[1.0625rem] font-medium text-ink transition-colors active:text-maroon aria-[current=true]:text-maroon"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-4 w-full">
                <a href={site.cta.wishlist.href} onClick={follow(site.cta.wishlist.href)}>
                  {site.cta.wishlist.label}
                </a>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
