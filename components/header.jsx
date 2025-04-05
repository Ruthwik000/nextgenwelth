"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard, Menu, X, MessageSquare } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Logo } from "./ui/logo";

const Header = () => {
  // Use useUser hook for client-side user data
  const { isLoaded, user } = useUser();

  return (
    <HeaderClient isLoaded={isLoaded} user={user} />
  );
};

const HeaderClient = ({ isLoaded, user }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle initial client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        setScrolled(window.scrollY > 10);
      };

      window.addEventListener("scroll", handleScroll);
      // Initial check
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Only apply dynamic classes after component has mounted on client
  // This prevents hydration mismatch
  const headerClass = cn(
    "fixed top-0 w-full z-50 transition-all duration-300",
    mounted && scrolled ? "bg-black/30 shadow-md backdrop-blur-md" : "bg-transparent"
  );

  const bgClass = cn(
    "absolute inset-0 transition-all duration-300",
    mounted && scrolled ? "backdrop-blur-md bg-background/10 border-b border-border/20" : "backdrop-blur-sm bg-transparent"
  );

  return (
    <header className={headerClass}>
      <div className={bgClass}></div>
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between relative">
        <Link href="/" className="relative z-10">
          <div className="flex items-center gap-2">
            {/* Use custom NextGenWelth logo component */}
            <Logo className="transition-opacity duration-300 hover:opacity-90" size="default" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <SignedOut>
            <div className="flex items-center gap-6">
              <a
                href="#features"
                className="text-foreground/80 hover:text-primary transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-foreground/80 hover:text-primary transition-colors font-medium"
              >
                Pricing
              </a>
            </div>
          </SignedOut>

          {isLoaded && user && (
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-foreground/80 hover:text-primary transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/transaction/create"
                className="text-foreground/80 hover:text-primary transition-colors font-medium"
              >
                Add Transaction
              </Link>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <div className="hidden sm:flex items-center gap-3">
              <SignInButton forceRedirectUrl="/dashboard">
                <Button variant="outline" size="sm" className="btn-hover border-primary/30 text-white hover:bg-primary/10 backdrop-blur-sm transition-all duration-300">
                  Login
                </Button>
              </SignInButton>
              <SignInButton forceRedirectUrl="/dashboard">
                <Button size="sm" className="btn-hover bg-primary hover:bg-primary/90 text-white transition-all duration-300">
                  Sign Up
                </Button>
              </SignInButton>
            </div>
          </SignedOut>

          {/* Chat button for all users - Only render on client side */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-primary/20 relative transition-all duration-300"
              onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
              title="Chat with WelthGPT"
            >
              <MessageSquare size={20} className="text-primary" />
            </Button>
          )}

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                }
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>

          {/* Mobile Menu Button - Only render on client side */}
          {mounted && (
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-primary/20 relative z-50 transition-all duration-300"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? <X size={24} className="text-primary" /> : <Menu size={24} className="text-primary" />}
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu - Only render on client side to prevent hydration issues */}
      {mounted && (
        <div
          className={`fixed inset-0 bg-black/70 backdrop-blur-xl z-40 transition-transform duration-300 transform ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } md:hidden`}
        >
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col gap-8">
            <div className="flex justify-center mb-8">
              <Logo className="transition-opacity duration-300" size="large" />
            </div>
            {/* Chat button for all users */}
            <button
              className="text-2xl font-semibold hover:text-primary transition-colors py-2 text-left flex items-center gap-2"
              onClick={() => {
                setMobileMenuOpen(false);
                window.dispatchEvent(new CustomEvent('open-chat'));
              }}
            >
              <MessageSquare size={20} className="text-primary" />
              Chat with WelthGPT
            </button>

            <SignedOut>
              <div className="flex flex-col gap-6 mt-6">
                <a
                  href="#features"
                  className="text-2xl font-semibold hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-2xl font-semibold hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>
              </div>

              <div className="flex flex-col gap-4 mt-8">
                <SignInButton forceRedirectUrl="/dashboard">
                  <Button variant="outline" size="lg" className="w-full border-primary/30 hover:bg-primary/10 transition-all duration-300">
                    Login
                  </Button>
                </SignInButton>
                <SignInButton forceRedirectUrl="/dashboard">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-white transition-all duration-300">
                    Sign Up
                  </Button>
                </SignInButton>
              </div>
            </SignedOut>

            {isLoaded && user && (
              <div className="flex flex-col gap-6 mt-6">
                <Link
                  href="/dashboard"
                  className="text-2xl font-semibold hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/transaction/create"
                  className="text-2xl font-semibold hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Add Transaction
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      )}  {/* Close the mounted conditional */}
    </header>
  );
};

export default Header;
