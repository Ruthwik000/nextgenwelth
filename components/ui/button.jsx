import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        
        outline:
          "border border-input bg-background hover:bg-muted hover:border-primary/40 shadow-sm",
        
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        
        ghost: "hover:bg-muted hover:text-primary",
        
        link: "text-primary underline-offset-4 hover:underline",
        
        gradient: "bg-gradient-to-r from-primary via-secondary to-accent text-white border border-white/10 hover:shadow-md hover:shadow-primary/20 hover:scale-105 transition-all duration-300",
        
        subtle: "bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10 rounded-full",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
      animation: "none",
    },
    compoundVariants: [
      {
        variant: "gradient",
        class: "bg-size-200 bg-pos-0 hover:bg-pos-100 transition-all duration-500",
      },
    ],
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, rounded, animation, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, animation, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
