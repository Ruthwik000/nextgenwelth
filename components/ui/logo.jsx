"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, size = "default", showIcon = true, animated = true }) {
  const sizeClasses = {
    small: "text-lg",
    default: "text-2xl",
    large: "text-3xl"
  };

  const iconSizes = {
    small: "h-4 w-4",
    default: "h-5 w-5",
    large: "h-6 w-6"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && (
        <div className="relative">
          <div className={cn(
            "absolute -inset-1 rounded-full bg-primary/20 blur-sm",
            animated ? "animate-pulse-slow" : ""
          )} />
          <TrendingUp
            className={cn("text-primary", iconSizes[size])}
            strokeWidth={2.5}
          />
        </div>
      )}
      <div className={cn("font-bold tracking-tight", sizeClasses[size])}>
        <span className={cn(
          "bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent",
          animated && "animate-gradient-x"
        )}>
          NextGen
        </span>
        <span className="text-foreground">Welth</span>
      </div>
    </div>
  );
}
