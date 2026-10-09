"use client";

import { useId, useState } from "react";
import { ArrowRight, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { site } from "@/lib/site";
import { Reveal } from "@/components/ui/reveal";

type Status = "idle" | "sending" | "done" | "error" | "unconfigured";

export function FinalCTA() {
  const [status, setStatus] = useState<Status>("idle");
  const [invalid, setInvalid] = useState(false);
  const emailId = useId();
  const msgId = useId();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email");
    if (!form.checkValidity() || typeof email !== "string") {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    if (!site.wishlistFormAction) {
      setStatus("unconfigured");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(site.wishlistFormAction, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const message = invalid
    ? { tone: "error", text: "Enter a valid email address." }
    : status === "done"
      ? { tone: "success", text: "You're on the list. We'll email you when Shortzy is ready." }
      : status === "error"
        ? { tone: "error", text: "That didn't go through. Please try again." }
        : status === "unconfigured"
          ? { tone: "info", text: "Wishlist signups aren't connected yet. Check back soon." }
          : null;

  return (
    <section id="wishlist" aria-labelledby="final-title" className="pb-24 pt-8 sm:pb-32">
      <Container>
        <Reveal className="grain relative overflow-hidden rounded-[32px] bg-rose px-6 py-14 sm:px-12 sm:py-16 lg:px-16">
          <div aria-hidden="true" className="perf-rail absolute inset-x-0 top-4 h-3 text-maroon/10" />
          <div aria-hidden="true" className="perf-rail absolute inset-x-0 bottom-4 h-3 text-maroon/10" />

          <div className="relative mx-auto max-w-[760px] text-center">
            <h2
              id="final-title"
              className="font-display text-[clamp(2.3rem,5.4vw,4.4rem)] font-extrabold leading-[0.95] tracking-[-0.04em]"
            >
              Your next short is <span className="text-maroon">already recorded.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-[50ch] text-[1.0625rem] leading-relaxed text-ink/75 sm:text-[1.125rem]">
              Shortzy is coming to Mac and Windows. Join the wishlist and we&apos;ll let you know the moment you can
              point it at last week&apos;s video.
            </p>

            <form noValidate onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-[520px] flex-col gap-3 sm:flex-row">
              <label htmlFor={emailId} className="sr-only">
                Email address
              </label>
              <input
                id={emailId}
                onBlur={(e) => {
                  // Validate inline once the person has typed something, not only on submit.
                  if (e.currentTarget.value) setInvalid(!e.currentTarget.validity.valid);
                }}
                onInput={(e) => {
                  if (invalid && e.currentTarget.validity.valid) setInvalid(false);
                }}
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={invalid || undefined}
                aria-describedby={message ? msgId : undefined}
                className="min-h-14 w-full flex-1 rounded-lg border border-mute bg-white px-4 text-[1rem] text-ink placeholder:text-mute hover:border-maroon focus:border-maroon aria-[invalid=true]:border-2 aria-[invalid=true]:border-[#982D3F]"
              />
              <Button
                type="submit"
                size="lg"
                className="group"
                aria-busy={status === "sending" || undefined}
                disabled={status === "sending"}
              >
                {status === "sending" ? "Joining…" : site.cta.wishlist.label}
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </form>

            <p id={msgId} role="status" aria-live="polite" className="mt-3 min-h-6 text-[0.875rem]">
              {message && (
                <span
                  className={
                    message.tone === "success"
                      ? "inline-flex items-center gap-1.5 font-semibold text-success"
                      : message.tone === "error"
                        ? "font-semibold text-[#982D3F]"
                        : "text-ink/75"
                  }
                >
                  {message.tone === "success" && <Check className="size-4" aria-hidden="true" />}
                  {message.text}
                </span>
              )}
            </p>

            <div className="mt-4 flex flex-col items-center gap-3">
              <Button asChild variant="link">
                <a href={site.cta.howItWorks.href}>
                  <Play className="!size-3.5 fill-current" />
                  {site.cta.howItWorks.label}
                </a>
              </Button>
              <p className="text-[0.8125rem] text-ink/70">No spam. Just one email when it&apos;s ready.</p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
