import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-primary bg-primary text-primary-foreground shadow-[0_4px_0_0_#15803d] hover:shadow-[0_2px_0_0_#15803d] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]",
        destructive: "bg-destructive text-destructive-foreground shadow-[0_4px_0_0_#991b1b] hover:shadow-[0_2px_0_0_#991b1b] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]",
        outline: "border border-input bg-background shadow-[0_4px_0_0_#d1d5db] hover:shadow-[0_2px_0_0_#d1d5db] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]",
        secondary: "bg-secondary text-secondary-foreground shadow-[0_4px_0_0_#9ca3af] hover:shadow-[0_2px_0_0_#9ca3af] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
