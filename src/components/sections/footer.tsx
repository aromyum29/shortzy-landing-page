import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { nav, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-pebble bg-paper py-12">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo />
            <p className="mt-3 font-display text-[1.125rem] font-semibold tracking-[-0.01em] text-maroon">{site.tagline}</p>
          </div>
          <nav aria-label="Footer">
            {/* Links carry their own padding for 44px targets; the list's negative margin keeps the text on the container edges. */}
            <ul className="-mx-2 grid grid-cols-2 gap-x-6 sm:flex sm:gap-x-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex min-h-11 min-w-11 items-center rounded-lg px-2 text-[0.9375rem] text-ink/80 transition-colors duration-100 hover:text-maroon"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-pebble pt-6 text-[0.8125rem] text-mute sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Shortzy. Made for creators who&apos;d rather be recording.</p>
          <p>Gemini is a trademark of Google LLC. Qwen is a trademark of Alibaba Cloud. Kimi is a trademark of Moonshot AI.</p>
        </div>
      </Container>
    </footer>
  );
}
