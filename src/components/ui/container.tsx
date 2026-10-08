import { cn } from "@/lib/utils";

export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

/** Small mono label used above section headings, like a timecode slate. */
export function Eyebrow({ className, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-maroon",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="inline-block h-[10px] w-[14px] rounded-[2px] bg-current opacity-80" />
      {children}
    </p>
  );
}
