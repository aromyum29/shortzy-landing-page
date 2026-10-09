"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { nav, site } from "@/lib/site";
import { cn } from "@/lib/utils";

const SPRING = { type: "spring", bounce: 0, visualDuration: 0.3 } as const;

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

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const active = useActiveSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={cn("sticky top-0 z-50 transition-colors duration-200", scrolled || open ? "bg-paper" : "bg-paper/0")}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-[72px] w-full max-w-[1200px] items-center gap-6 px-4 sm:px-6 lg:px-8">
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
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={site.cta.wishlist.href}>{site.cta.wishlist.shortLabel}</a>
          </Button>
          <button
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
          scrolled && !open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Mobile menu drops out of the bar and returns the same way. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={menuId}
            key="menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: SPRING, opacity: { duration: 0.2 } }}
            className="overflow-hidden border-t border-pebble bg-paper shadow-[0_16px_24px_-20px_rgba(41,38,40,0.4)] lg:hidden"
          >
            <nav aria-label="Mobile" className="mx-auto max-w-[1200px] px-4 pb-6 pt-2 sm:px-6">
              <ul className="divide-y divide-pebble/70">
                {nav.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active === item.href.slice(1) ? "true" : undefined}
                      className="flex min-h-12 items-center text-[1.0625rem] font-medium text-ink transition-colors active:text-maroon aria-[current=true]:text-maroon"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-4 w-full">
                <a href={site.cta.wishlist.href} onClick={() => setOpen(false)}>
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
