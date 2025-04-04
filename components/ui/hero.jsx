"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import Link from "next/link"
import { BackgroundPaths } from "./background-paths"

const Hero = React.forwardRef(
  (
    {
      className,
      title,
      subtitle,
      actions,
      titleClassName,
      subtitleClassName,
      actionsClassName,
      ...props
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          "relative z-0 flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-black",
          className,
        )}
        {...props}
      >
        {/* Background Paths */}
        <div className="absolute inset-0">
          <BackgroundPaths />
        </div>

        <motion.div
          initial={{ y: 100, opacity: 0.5 }}
          viewport={{ once: true }}
          transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="relative z-50 container flex justify-center flex-1 flex-col px-5 md:px-10 gap-4"
        >
          <div className="flex flex-col items-center text-center space-y-8">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn(
                "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight",
                titleClassName,
              )}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <p
                className={cn(
                  "text-xl text-muted-foreground",
                  subtitleClassName,
                )}
              >
                {subtitle}
              </p>
            )}
            {actions && actions.length > 0 && (
              <div className={cn("flex gap-4", actionsClassName)}>
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    asChild
                    className="rounded-full px-8 py-6 text-lg font-semibold backdrop-blur-md 
                    bg-white/5 hover:bg-white/10 text-white transition-all duration-300 
                    hover:-translate-y-0.5 border border-white/10
                    hover:shadow-lg hover:shadow-white/5"
                  >
                    <Link href={action.href} className="flex items-center gap-3">
                      <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                        {action.label}
                      </span>
                      {action.icon && (
                        <span className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                          {action.icon}
                        </span>
                      )}
                    </Link>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </section>
    )
  },
)
Hero.displayName = "Hero"

export { Hero } 