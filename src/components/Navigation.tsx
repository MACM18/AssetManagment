"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Briefcase } from "lucide-react";
import AuthButton from "./auth/AuthButton";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <nav className='backdrop-blur-md sticky top-0 z-40'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo and Brand */}
          <div className='flex items-center gap-8'>
            <Link href='/' className='flex items-center gap-2'>
              <div className='p-1.5 rounded-lg'>
                <TrendingUp className='w-5 h-5' />
              </div>
              <span className='text-xl font-bold'>stock.macm.dev</span>
            </Link>

            {/* Navigation Links */}
            <div className='hidden md:flex items-center gap-1'>
              <Link
                href='/'
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  pathname === "/" ? "" : "hover:opacity-80"
                }`}
              >
                Market
              </Link>

              {isAuthenticated && (
                <Link
                  href='/portfolio'
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    pathname === "/portfolio" ? "" : "hover:opacity-80"
                  }`}
                >
                  <Briefcase className='w-4 h-4' />
                  Portfolio
                </Link>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center gap-3'>
            <AuthButton />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isAuthenticated && (
        <div className='md:hidden px-4 py-2 flex gap-2'>
          <Link
            href='/'
            className={`flex-1 px-3 py-2 rounded-lg text-center font-medium transition-all duration-200 ${
              pathname === "/" ? "" : "hover:opacity-80"
            }`}
          >
            Market
          </Link>
          <Link
            href='/portfolio'
            className={`flex-1 px-3 py-2 rounded-lg text-center font-medium transition-all duration-200 ${
              pathname === "/portfolio" ? "" : "hover:opacity-80"
            }`}
          >
            Portfolio
          </Link>
        </div>
      )}
    </nav>
  );
}
