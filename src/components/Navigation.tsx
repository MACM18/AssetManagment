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
    <nav className='bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo and Brand */}
          <div className='flex items-center gap-8'>
            <Link href='/' className='flex items-center gap-2 group'>
              <TrendingUp className='w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors' />
              <span className='text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors'>
                stock.macm.dev
              </span>
            </Link>

            {/* Navigation Links */}
            <div className='hidden md:flex items-center gap-1'>
              <Link
                href='/'
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  pathname === "/"
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                Market
              </Link>

              {isAuthenticated && (
                <Link
                  href='/portfolio'
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    pathname === "/portfolio"
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
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
        <div className='md:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-2 flex gap-2'>
          <Link
            href='/'
            className={`flex-1 px-3 py-2 rounded-lg text-center font-medium transition-colors ${
              pathname === "/"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:bg-gray-800"
            }`}
          >
            Market
          </Link>
          <Link
            href='/portfolio'
            className={`flex-1 px-3 py-2 rounded-lg text-center font-medium transition-colors ${
              pathname === "/portfolio"
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:bg-gray-800"
            }`}
          >
            Portfolio
          </Link>
        </div>
      )}
    </nav>
  );
}
