// Importing the Hero component from UI library
import { Hero } from "../ui/hero"

/**
 * HeroDemo component - Displays the main hero section with title, subtitle and call-to-action
 * Uses the Hero UI component with custom styling props
 */
export function HeroDemo() {
  return (
    <Hero
      // Main headline text
      title="AI that works for your finances."
      // Supporting subtitle text
      subtitle="Transform your financial management with intelligent automation. Simple, powerful, reliable."
      // Array of action buttons with their properties
      actions={[
        {
          label: "Get Started",
          href: "/dashboard",
          variant: "gradient"
        }
      ]}
      // Custom class names for styling different elements
      titleClassName="text-5xl md:text-6xl font-extrabold gradient-title"
      subtitleClassName="text-lg md:text-xl max-w-[600px]"
      actionsClassName="mt-8"
    />
  );
}