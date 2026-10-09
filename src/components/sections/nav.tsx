"use client";

import { useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { nav, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();

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
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-200",
        scrolled || open ? "border-pebble bg-paper" : "border-transparent bg-paper/0",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-[72px] w-full max-w-[1200px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <a href="#top" aria-label="Shortzy home" className="shrink-0">
          <Logo />
        </a>

        <nav aria-label="Main" className="ml-4 hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-[15px] font-medium text-ink/80 transition-colors hover:bg-white hover:text-maroon"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={site.cta.wishlist.href}>{site.cta.wishlist.shortLabel}</a>
          </Button>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-lg text-ink hover:bg-white lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      <div id={menuId} hidden={!open} className="border-t border-pebble bg-paper lg:hidden">
        <nav aria-label="Mobile" className="mx-auto max-w-[1200px] px-4 pb-6 pt-2 sm:px-6">
          <ul className="divide-y divide-pebble/70">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center text-[17px] font-medium text-ink"
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
      </div>
    </header>
  );
}
