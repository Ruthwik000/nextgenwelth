import { Hero } from "@/components/ui/hero"

function HeroDemo() {
  return (
    <Hero
      title="AI that works for your finances."
      subtitle="Transform your financial management with intelligent automation. Simple, powerful, reliable."
      actions={[
        {
          label: "Try Demo",
          href: "#",
          variant: "outline"
        },
        {
          label: "Start Free",
          href: "/dashboard",
          variant: "default"
        }
      ]}
      titleClassName="text-5xl md:text-6xl font-extrabold gradient-title"
      subtitleClassName="text-lg md:text-xl max-w-[600px]"
      actionsClassName="mt-8"
    />
  );
}

export { HeroDemo } 