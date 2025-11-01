"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Briefcase, Menu, X } from "lucide-react";
import { useState } from "react";
import AuthButton from "./auth/AuthButton";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className='sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo and Brand */}
          <div className='flex items-center gap-6 md:gap-8'>
            <Link
              href='/'
              className='flex items-center gap-2 group transition-transform hover:scale-105'
            >
              <div className='p-1.5 rounded-lg bg-primary text-primary-foreground shadow-md group-hover:shadow-lg transition-shadow'>
                <TrendingUp className='w-5 h-5' />
              </div>
              <span className='text-lg sm:text-xl font-bold text-foreground'>
                stock.macm.dev
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className='hidden md:flex items-center gap-1'>
              <Link
                href='/'
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive("/")
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Market
              </Link>

              {isAuthenticated && (
                <Link
                  href='/portfolio'
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive("/portfolio")
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Briefcase className='w-4 h-4' />
                  Portfolio
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className='hidden md:flex items-center gap-3'>
            <ThemeToggle />
            <AuthButton />
          </div>

          {/* Mobile Menu Button */}
          <div className='md:hidden flex items-center gap-2'>
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='p-2 rounded-lg hover:bg-muted transition-colors'
              aria-label='Toggle menu'
            >
              {mobileMenuOpen ? (
                <X className='w-6 h-6' />
              ) : (
                <Menu className='w-6 h-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className='md:hidden py-4 border-t border-border animate-slide-up'>
            <div className='flex flex-col gap-2'>
              <Link
                href='/'
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive("/")
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Market
              </Link>

              {isAuthenticated && (
                <Link
                  href='/portfolio'
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive("/portfolio")
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Briefcase className='w-4 h-4' />
                  Portfolio
                </Link>
              )}

              <div className='mt-2 pt-2 border-t border-border'>
                <AuthButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
