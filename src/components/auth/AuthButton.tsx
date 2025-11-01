"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import Image from "next/image";

export default function AuthButton() {
  const { user, isAuthenticated, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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
        <div className='w-8 h-8 rounded-full animate-pulse border'></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-2'>
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || "User"}
              className='w-8 h-8 rounded-full ring-2'
              width={32}
              height={32}
            />
          ) : (
            <div className='w-8 h-8 rounded-full flex items-center justify-center font-medium shadow-md border'>
              {user.displayName?.[0]?.toUpperCase() ||
                user.email?.[0]?.toUpperCase() ||
                "U"}
            </div>
          )}
          <span className='text-sm font-medium hidden sm:inline'>
            {user.displayName || user.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className='px-4 py-2 text-sm font-medium border rounded-lg transition-all shadow-sm hover:shadow-md'
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
        className='px-4 py-2 text-sm font-medium border rounded-lg shadow-md hover:shadow-lg transition-all'
      >
        Sign In
      </button>

      {mounted &&
        showAuthModal &&
        createPortal(
          <div className='fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto'>
            <div className='relative w-full max-w-md'>
              <button
                onClick={() => setShowAuthModal(false)}
                className='absolute -top-2 -right-2 w-8 h-8 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all z-10 border'
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
          </div>,
          document.body
        )}
    </>
  );
}
