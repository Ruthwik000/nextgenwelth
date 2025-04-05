import React from "react";
import Link from "next/link";
import {
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Github
} from "lucide-react";
import { Logo } from "./ui/logo";

const Footer = () => {
  return (
    <footer className="relative pt-28 pb-16 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-background/90 to-transparent z-0"></div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>

      {/* Subtle glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30rem] h-36 rounded-full bg-primary/20 opacity-30 blur-3xl z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-16">
          <div>
            <Link href="/" className="inline-block mb-8">
              <Logo size="default" className="hover:opacity-90 transition-opacity duration-300" />
            </Link>
            <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
              NextGenWelth is revolutionizing personal finance with AI-powered insights and intelligent wealth management for the next generation.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:scale-110">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:scale-110">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:scale-110">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:scale-110">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:scale-110">
                <Github size={20} />
              </a>
            </div>
          </div>

          <div className="md:ml-auto md:text-right md:pl-8 lg:pl-16">
            <h3 className="font-bold text-lg mb-8">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:-translate-x-1 inline-block">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:-translate-x-1 inline-block">
                  Features
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 mt-4 border-t border-white/10">
          <div className="flex justify-center items-center py-6">
            <p className="text-muted-foreground text-sm text-center">
              © 2025 NextGenWelth. Designed and developed by <span className="text-primary font-medium hover:underline cursor-pointer transition-colors duration-300">G. Ruthwik</span>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;