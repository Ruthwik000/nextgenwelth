"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard, Menu, X, MessageSquare } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { cn } from "../lib/utils";
import { ChatBot } from "./chatbot/ChatBot";

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

  const openChatbot = () => {
    const trigger = document.getElementById('chatbot-trigger');
    if (trigger) {
      trigger.click();
    }
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
          
          {isLoaded && user && (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:bg-white/10"
                onClick={openChatbot}
              >
                <MessageSquare className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium flex items-center justify-center">
                  AI
                </span>
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
        "md:hidden fixed inset-0 bg-black/95 backdrop-blur-lg z-40 transition-transform duration-300",
        mobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-6">
            <SignedOut>
              <div className="flex flex-col gap-4">
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
              <div className="flex flex-col gap-4">
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
                <button
                  className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors font-medium"
                  onClick={openChatbot}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>AI Assistant</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ChatBot Component */}
      <ChatBot />
    </header>
  );
};

export default Header;
