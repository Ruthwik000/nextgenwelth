// Importing the BackgroundPaths component
import { BackgroundPaths } from "@/components/ui/background-paths"

/**
 * HeroDemo component - Displays the main hero section with animated background paths
 * Uses the BackgroundPaths UI component with custom title, subtitle and button
 */
function HeroDemo() {
  return (
    <BackgroundPaths
      title="AI that works for your finances."
      subtitle="Transform your financial management with intelligent automation. Simple, powerful, reliable."
      buttonText="Get Started"
      buttonHref="/dashboard"
    />
  );
}

export { HeroDemo }