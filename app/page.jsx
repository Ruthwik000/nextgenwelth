import { HeroDemo } from "../components/blocks/hero";
import Features from "../components/features";
import Footer from "../components/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroDemo />
      <Features />
      <Footer />
    </main>
  );
}