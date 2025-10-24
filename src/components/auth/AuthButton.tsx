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
              className='w-8 h-8 rounded-full'
            />
          ) : (
            <div className='w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium'>
              {user.displayName?.[0]?.toUpperCase() ||
                user.email?.[0]?.toUpperCase() ||
                "U"}
            </div>
          )}
          <span className='text-sm font-medium text-gray-700 hidden sm:inline'>
            {user.displayName || user.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900'
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
        className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'
      >
        Sign In
      </button>

      {showAuthModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='relative'>
            <button
              onClick={() => setShowAuthModal(false)}
              className='absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 z-10'
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
