"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Briefcase } from "lucide-react";
import AuthButton from "./auth/AuthButton";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <nav className='bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm dark:shadow-gray-900/30'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo and Brand */}
          <div className='flex items-center gap-8'>
            <Link href='/' className='flex items-center gap-2 group'>
              <div className='p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-all shadow-md group-hover:shadow-lg'>
                <TrendingUp className='w-5 h-5 text-white' />
              </div>
              <span className='text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent'>
                stock.macm.dev
              </span>
            </Link>

            {/* Navigation Links */}
            <div className='hidden md:flex items-center gap-1'>
              <Link
                href='/'
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  pathname === "/"
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                Market
              </Link>

              {isAuthenticated && (
                <Link
                  href='/portfolio'
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    pathname === "/portfolio"
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
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
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isAuthenticated && (
        <div className='md:hidden border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-4 py-2 flex gap-2'>
          <Link
            href='/'
            className={`flex-1 px-3 py-2 rounded-lg text-center font-medium transition-all duration-200 ${
              pathname === "/"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            Market
          </Link>
          <Link
            href='/portfolio'
            className={`flex-1 px-3 py-2 rounded-lg text-center font-medium transition-all duration-200 ${
              pathname === "/portfolio"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            Portfolio
          </Link>
        </div>
      )}
    </nav>
  );
}
