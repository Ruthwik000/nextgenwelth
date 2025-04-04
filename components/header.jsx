"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Menu, X, TrendingUp, MessageCircle } from "lucide-react";
import Link from "next/link";
import { SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { cn } from "../lib/utils";
import { ChatBot } from "./chatbot/ChatBot";

const Header = () => {
  const { isLoaded, user } = useUser();
  
  return (
    <HeaderClient isLoaded={isLoaded} user={user} />
  );
};

const HeaderClient = ({ isLoaded, user }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
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

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <ChatBot isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled ? "bg-black/40 shadow-md backdrop-blur-md" : "bg-black/30 backdrop-blur-sm"
    )}>
      <div className="absolute inset-0 backdrop-blur-md bg-black/30 border-b border-white/10"></div>
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between relative">
        <Link href="/" className="relative z-10">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-cyan-400" />
            <span className="text-2xl font-bold text-white">NextGen Welth</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <SignedOut>
            <div className="flex items-center gap-6">
              <a 
                href="#features" 
                className="text-white hover:text-cyan-400 transition-colors font-medium"
              >
                Features
              </a>
              <a 
                href="#pricing" 
                className="text-white hover:text-cyan-400 transition-colors font-medium"
              >
                Pricing
              </a>
            </div>
          </SignedOut>
          
          {isLoaded && user && (
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard" 
                className="text-white hover:text-cyan-400 transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/transaction/create" 
                className="text-white hover:text-cyan-400 transition-colors font-medium"
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
                <Button variant="outline" size="sm" className="border-cyan-500/20 text-white hover:bg-cyan-500/10 backdrop-blur-sm">
                  Login
                </Button>
              </SignInButton>
              <SignInButton forceRedirectUrl="/dashboard">
                <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  Sign Up
                </Button>
              </SignInButton>
            </div>
          </SignedOut>
          
          {isLoaded && user && (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-white transition-colors",
                  isOpen ? "text-cyan-400" : "hover:text-cyan-400"
                )}
                onClick={toggleChat}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden relative z-10 text-white"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden fixed inset-0 bg-black/90 backdrop-blur-lg z-40 transition-transform duration-300",
        mobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-6">
            <SignedOut>
              <div className="flex flex-col gap-4">
                <a 
                  href="#features" 
                  className="text-white/80 hover:text-cyan-400 transition-colors font-medium"
                >
                  Features
                </a>
                <a 
                  href="#pricing" 
                  className="text-white/80 hover:text-cyan-400 transition-colors font-medium"
                >
                  Pricing
                </a>
              </div>
            </SignedOut>
            
            {isLoaded && user && (
              <div className="flex flex-col gap-4">
                <Link
                  href="/dashboard" 
                  className="text-white/80 hover:text-cyan-400 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/transaction/create" 
                  className="text-white/80 hover:text-cyan-400 transition-colors font-medium"
                >
                  Add Transaction
                </Link>
                <button
                  className="flex items-center gap-2 text-white/80 hover:text-cyan-400 transition-colors font-medium"
                  onClick={toggleChat}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>AI Assistant</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;
