"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard, Menu, X } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

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
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled ? "bg-black/80 shadow-md backdrop-blur-md" : "bg-transparent"
    )}>
      <div className="absolute inset-0 backdrop-blur-lg bg-background/70 border-b border-border/40"></div>
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between relative">
        <Link href="/" className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold gradient-title">FinanceAI</span>
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
                <Button variant="outline" size="sm" className="btn-hover border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                  Login
                </Button>
              </SignInButton>
              <SignInButton forceRedirectUrl="/dashboard">
                <Button size="sm" className="btn-hover gradient text-white">
                  Sign Up
                </Button>
              </SignInButton>
            </div>
          </SignedOut>
          
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 relative z-50"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-black/95 backdrop-blur-lg z-40 transition-transform duration-300 transform ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col gap-8">
            <SignedOut>
              <div className="flex flex-col gap-6">
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
                  <Button variant="outline" size="lg" className="w-full border-white/20 hover:bg-white/10">
                    Login
                  </Button>
                </SignInButton>
                <SignInButton forceRedirectUrl="/dashboard">
                  <Button size="lg" className="w-full gradient text-white">
                    Sign Up
                  </Button>
                </SignInButton>
              </div>
            </SignedOut>
            
            {isLoaded && user && (
              <div className="flex flex-col gap-6">
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
    </header>
  );
};

export default Header;
