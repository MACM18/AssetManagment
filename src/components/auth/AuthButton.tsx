"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthButton() {
  const { user, isAuthenticated, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center gap-2'>
        <div className='w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse'></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-2'>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              className='w-8 h-8 rounded-full ring-2 ring-blue-500/20'
            />
          ) : (
            <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-medium shadow-md'>
              {user.displayName?.[0]?.toUpperCase() ||
                user.email?.[0]?.toUpperCase() ||
                "U"}
            </div>
          )}
          <span className='text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline'>
            {user.displayName || user.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md'
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          setAuthMode("login");
          setShowAuthModal(true);
        }}
        className='px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all'
      >
        Sign In
      </button>

      {showAuthModal && (
        <div className='fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto'>
          <div className='relative w-full max-w-md mx-auto my-8'>
            <button
              onClick={() => setShowAuthModal(false)}
              className='absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-xl transition-all z-10 border border-gray-200 dark:border-gray-700'
            >
              ✕
            </button>
            {authMode === "login" ? (
              <LoginForm
                onSwitchToRegister={() => setAuthMode("register")}
                onClose={() => setShowAuthModal(false)}
              />
            ) : (
              <RegisterForm
                onSwitchToLogin={() => setAuthMode("login")}
                onClose={() => setShowAuthModal(false)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
