import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * shadcn Button, restyled to the Shortzy v3.2 interaction tokens:
 * primary = white on maroon, secondary = maroon outline on white,
 * 12px control radius, 48px minimum height for primary actions.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border-2 border-transparent font-semibold transition-[background-color,border-color,color,transform] duration-150 ease-brand disabled:pointer-events-none disabled:border-[#E4E1DD] disabled:bg-[#E4E1DD] disabled:text-mute [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "bg-maroon text-white hover:bg-maroon-hover active:bg-maroon-pressed",
        secondary:
          "border-maroon bg-white text-maroon hover:border-maroon-hover hover:bg-paper hover:text-maroon-hover active:border-maroon-pressed active:bg-rose active:text-maroon-pressed",
        ghost:
          "bg-transparent text-maroon hover:bg-paper hover:text-maroon-hover active:bg-rose active:text-maroon-pressed",
        paper:
          "bg-paper text-maroon hover:bg-white active:bg-rose active:text-maroon-pressed",
        outlineOnDark:
          "border-paper/70 bg-transparent text-paper hover:border-paper hover:bg-white/10 active:bg-white/15",
        link: "border-0 px-0 text-maroon underline underline-offset-4 hover:text-maroon-hover",
      },
      size: {
        default: "min-h-12 px-5 py-2.5 text-[15px] [&_svg]:size-[18px]",
        sm: "min-h-10 px-4 py-2 text-sm [&_svg]:size-4",
        lg: "min-h-14 px-6 py-3 text-base [&_svg]:size-5",
        icon: "size-12 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
